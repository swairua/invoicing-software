-- Tax Configuration Migration
-- Migration: 003_tax_configuration.sql

-- ========================================
-- TAX CONFIGURATION TABLES
-- ========================================

-- Tax types enum
CREATE TYPE tax_type AS ENUM ('vat', 'sales_tax', 'gst', 'custom');

-- Tax calculation method enum
CREATE TYPE tax_calculation_method AS ENUM ('inclusive', 'exclusive');

-- Tax configurations
CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    tax_type tax_type DEFAULT 'vat',
    rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    calculation_method tax_calculation_method DEFAULT 'exclusive',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_from DATE DEFAULT CURRENT_DATE,
    applicable_until DATE NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_tax_config_company_code UNIQUE (company_id, code),
    CONSTRAINT check_rate_positive CHECK (rate >= 0),
    CONSTRAINT check_dates CHECK (applicable_until IS NULL OR applicable_until >= applicable_from)
);

-- Create indexes for tax configurations
CREATE INDEX idx_tax_config_company ON tax_configurations (company_id);
CREATE INDEX idx_tax_config_active ON tax_configurations (is_active, company_id);
CREATE INDEX idx_tax_config_default ON tax_configurations (is_default, company_id);

-- Tax exemption reasons
CREATE TABLE tax_exemption_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_tax_exemption_company_code UNIQUE (company_id, code)
);

-- Create indexes for tax exemption reasons
CREATE INDEX idx_tax_exemption_company ON tax_exemption_reasons (company_id);

-- Update products table to reference tax configuration
ALTER TABLE products 
ADD COLUMN tax_config_id UUID REFERENCES tax_configurations(id) ON DELETE SET NULL;

-- Create index for product tax configuration
CREATE INDEX idx_products_tax_config ON products (tax_config_id);

-- Update customers table for tax exemptions
ALTER TABLE customers 
ADD COLUMN tax_exemption_reason_id UUID REFERENCES tax_exemption_reasons(id) ON DELETE SET NULL,
ADD COLUMN tax_exemption_certificate VARCHAR(255),
ADD COLUMN tax_exemption_valid_until DATE;

-- Create indexes for customer tax exemptions
CREATE INDEX idx_customers_tax_exemption ON customers (tax_exemption_reason_id);

-- ========================================
-- UPDATE ITEM TABLES FOR CONFIGURABLE TAX
-- ========================================

-- Add tax configuration references to item tables
ALTER TABLE quotation_items 
ADD COLUMN tax_config_id UUID REFERENCES tax_configurations(id) ON DELETE SET NULL;

ALTER TABLE proforma_invoice_items 
ADD COLUMN tax_config_id UUID REFERENCES tax_configurations(id) ON DELETE SET NULL;

ALTER TABLE invoice_items 
ADD COLUMN tax_config_id UUID REFERENCES tax_configurations(id) ON DELETE SET NULL;

-- Create indexes for item tax configurations
CREATE INDEX idx_quotation_items_tax_config ON quotation_items (tax_config_id);
CREATE INDEX idx_proforma_items_tax_config ON proforma_invoice_items (tax_config_id);
CREATE INDEX idx_invoice_items_tax_config ON invoice_items (tax_config_id);

-- ========================================
-- FUNCTIONS FOR TAX CALCULATIONS
-- ========================================

-- Function to get applicable tax rate for a product and customer
CREATE OR REPLACE FUNCTION get_applicable_tax_rate(
    p_company_id UUID,
    p_product_id UUID,
    p_customer_id UUID,
    p_transaction_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_tax_rate DECIMAL(5,2) := 0.00;
    v_customer_exempt BOOLEAN := FALSE;
BEGIN
    -- Check if customer is tax exempt
    SELECT (tax_exemption_reason_id IS NOT NULL AND 
            (tax_exemption_valid_until IS NULL OR tax_exemption_valid_until >= p_transaction_date))
    INTO v_customer_exempt
    FROM customers 
    WHERE id = p_customer_id AND company_id = p_company_id;
    
    -- If customer is exempt, return 0
    IF v_customer_exempt THEN
        RETURN 0.00;
    END IF;
    
    -- Get tax rate from product's tax configuration
    SELECT COALESCE(tc.rate, 0.00)
    INTO v_tax_rate
    FROM products p
    LEFT JOIN tax_configurations tc ON p.tax_config_id = tc.id
    WHERE p.id = p_product_id 
    AND p.company_id = p_company_id
    AND (tc.id IS NULL OR (
        tc.is_active = TRUE 
        AND tc.applicable_from <= p_transaction_date
        AND (tc.applicable_until IS NULL OR tc.applicable_until >= p_transaction_date)
    ));
    
    -- If no product-specific tax config, get default company tax rate
    IF v_tax_rate IS NULL THEN
        SELECT COALESCE(tc.rate, c.vat_rate, 0.00)
        INTO v_tax_rate
        FROM companies c
        LEFT JOIN tax_configurations tc ON c.id = tc.company_id AND tc.is_default = TRUE AND tc.is_active = TRUE
        WHERE c.id = p_company_id;
    END IF;
    
    RETURN COALESCE(v_tax_rate, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate tax amount
CREATE OR REPLACE FUNCTION calculate_tax_amount(
    p_subtotal DECIMAL(15,2),
    p_tax_rate DECIMAL(5,2),
    p_calculation_method tax_calculation_method DEFAULT 'exclusive'
) RETURNS DECIMAL(15,2) AS $$
BEGIN
    IF p_calculation_method = 'inclusive' THEN
        -- Tax is included in the subtotal: tax = subtotal * (rate / (100 + rate))
        RETURN ROUND(p_subtotal * (p_tax_rate / (100 + p_tax_rate)), 2);
    ELSE
        -- Tax is exclusive: tax = subtotal * (rate / 100)
        RETURN ROUND(p_subtotal * (p_tax_rate / 100), 2);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- UPDATE TRIGGERS FOR TAX CALCULATIONS
-- ========================================

-- Function to auto-update tax calculations on invoice items
CREATE OR REPLACE FUNCTION update_tax_calculations()
RETURNS TRIGGER AS $$
DECLARE
    v_tax_rate DECIMAL(5,2);
    v_tax_amount DECIMAL(15,2);
    v_line_total DECIMAL(15,2);
    v_company_id UUID;
    v_customer_id UUID;
    v_issue_date DATE;
BEGIN
    -- Get invoice details
    SELECT i.company_id, i.customer_id, i.issue_date
    INTO v_company_id, v_customer_id, v_issue_date
    FROM invoices i
    WHERE i.id = NEW.invoice_id;
    
    -- Get applicable tax rate
    SELECT get_applicable_tax_rate(v_company_id, NEW.product_id, v_customer_id, v_issue_date)
    INTO v_tax_rate;
    
    -- Calculate tax amount
    v_tax_amount := calculate_tax_amount(
        (NEW.quantity * NEW.unit_price - NEW.discount_amount), 
        v_tax_rate
    );
    
    -- Calculate line total
    v_line_total := (NEW.quantity * NEW.unit_price - NEW.discount_amount) + v_tax_amount;
    
    -- Update the record
    NEW.vat_rate := v_tax_rate;
    NEW.vat_amount := v_tax_amount;
    NEW.line_total := v_line_total;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice items tax calculation
DROP TRIGGER IF EXISTS trigger_calculate_invoice_item_tax ON invoice_items;
CREATE TRIGGER trigger_calculate_invoice_item_tax
    BEFORE INSERT OR UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_calculations();

-- ========================================
-- INSERT DEFAULT TAX CONFIGURATIONS
-- ========================================

-- Insert default VAT configuration for existing companies
INSERT INTO tax_configurations (company_id, name, code, tax_type, rate, is_default, is_active)
SELECT 
    id,
    'Standard VAT',
    'VAT-STD',
    'vat'::tax_type,
    COALESCE(vat_rate, 16.00),
    TRUE,
    TRUE
FROM companies
WHERE id NOT IN (SELECT DISTINCT company_id FROM tax_configurations WHERE is_default = TRUE);

-- Insert zero-rated tax configuration
INSERT INTO tax_configurations (company_id, name, code, tax_type, rate, is_default, is_active)
SELECT 
    id,
    'Zero Rated',
    'VAT-ZERO',
    'vat'::tax_type,
    0.00,
    FALSE,
    TRUE
FROM companies;

-- Insert common tax exemption reasons
INSERT INTO tax_exemption_reasons (company_id, name, code, description)
SELECT 
    id,
    'Government Entity',
    'GOVT',
    'Government departments and agencies'
FROM companies;

INSERT INTO tax_exemption_reasons (company_id, name, code, description)
SELECT 
    id,
    'Diplomatic Mission',
    'DIPLOMATIC',
    'Diplomatic missions and international organizations'
FROM companies;

INSERT INTO tax_exemption_reasons (company_id, name, code, description)
SELECT 
    id,
    'Export Sale',
    'EXPORT',
    'Goods sold for export outside the country'
FROM companies;

-- ========================================
-- UPDATE TRIGGERS FOR TIMESTAMPS
-- ========================================

CREATE TRIGGER trigger_update_tax_configurations_updated_at
    BEFORE UPDATE ON tax_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tax_exemption_reasons_updated_at
    BEFORE UPDATE ON tax_exemption_reasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
