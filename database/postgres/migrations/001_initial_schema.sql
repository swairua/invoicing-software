-- Business ERP System Database Schema
-- PostgreSQL 14+ Compatible
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE SYSTEM TABLES
-- ========================================

-- Companies table (Multi-tenant support)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    kra_pin VARCHAR(50),
    vat_number VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    currency VARCHAR(3) DEFAULT 'KES',
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    invoice_prefix VARCHAR(10) DEFAULT 'INV',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for companies
CREATE INDEX idx_companies_active ON companies (is_active);
CREATE INDEX idx_companies_kra_pin ON companies (kra_pin);

-- Users table with role enum
CREATE TYPE user_role AS ENUM ('admin', 'sales', 'accountant', 'viewer', 'manager');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_active ON users (is_active, company_id);

-- ========================================
-- INVENTORY MANAGEMENT
-- ========================================

-- Product categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_categories_company_name UNIQUE (company_id, name)
);

-- Create indexes for product categories
CREATE INDEX idx_categories_company ON product_categories (company_id);
CREATE INDEX idx_categories_parent ON product_categories (parent_id);

-- Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    kra_pin VARCHAR(50),
    payment_terms INTEGER DEFAULT 30,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for suppliers
CREATE INDEX idx_suppliers_company ON suppliers (company_id);
CREATE INDEX idx_suppliers_active ON suppliers (is_active, company_id);

-- Product status enum
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued', 'out_of_stock');

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    brand VARCHAR(255),
    unit_of_measure VARCHAR(50) DEFAULT 'piece',
    
    -- Pricing
    purchase_price DECIMAL(15,2) DEFAULT 0.00,
    selling_price DECIMAL(15,2) NOT NULL,
    wholesale_price DECIMAL(15,2),
    retail_price DECIMAL(15,2),
    cost_price DECIMAL(15,2),
    markup_percentage DECIMAL(5,2),
    
    -- Physical attributes
    weight DECIMAL(10,3),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10) DEFAULT 'cm',
    
    -- Inventory
    current_stock DECIMAL(15,3) DEFAULT 0.000,
    reserved_stock DECIMAL(15,3) DEFAULT 0.000,
    min_stock DECIMAL(15,3) DEFAULT 0.000,
    max_stock DECIMAL(15,3) DEFAULT 0.000,
    reorder_level DECIMAL(15,3) DEFAULT 0.000,
    
    -- Location
    location VARCHAR(255),
    bin_location VARCHAR(100),
    
    -- Settings
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,2) DEFAULT 16.00,
    has_variants BOOLEAN DEFAULT FALSE,
    
    -- Status
    status product_status DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    tags JSONB,
    images JSONB,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_products_company_sku UNIQUE (company_id, sku)
);

-- Create indexes for products
CREATE INDEX idx_products_company ON products (company_id);
CREATE INDEX idx_products_sku ON products (company_id, sku);
CREATE INDEX idx_products_barcode ON products (barcode);
CREATE INDEX idx_products_status ON products (status, company_id);
CREATE INDEX idx_products_stock ON products (current_stock, min_stock);

-- Product variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    attributes JSONB, -- Store variant attributes like color, size, etc.
    price DECIMAL(15,2),
    stock DECIMAL(15,3) DEFAULT 0.000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_variants_sku UNIQUE (sku)
);

-- Create indexes for product variants
CREATE INDEX idx_variants_product ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);

-- Stock movement enums
CREATE TYPE movement_type AS ENUM ('in', 'out', 'adjustment', 'transfer');
CREATE TYPE reference_type AS ENUM ('purchase', 'sale', 'adjustment', 'return', 'transfer', 'production');

-- Stock movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    movement_type movement_type NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    previous_stock DECIMAL(15,3) NOT NULL,
    new_stock DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type reference_type,
    reference_id UUID,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stock movements
CREATE INDEX idx_stock_movements_company ON stock_movements (company_id);
CREATE INDEX idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements (created_at);
CREATE INDEX idx_stock_movements_reference ON stock_movements (reference_type, reference_id);

-- ========================================
-- CUSTOMER MANAGEMENT
-- ========================================

-- Customer type enum
CREATE TYPE customer_type AS ENUM ('individual', 'business');

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    kra_pin VARCHAR(50),
    
    -- Address
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    
    -- Financial
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    payment_terms INTEGER DEFAULT 30,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    customer_type customer_type DEFAULT 'business',
    tax_exempt BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    tags JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for customers
CREATE INDEX idx_customers_company ON customers (company_id);
CREATE INDEX idx_customers_name ON customers (name);
CREATE INDEX idx_customers_active ON customers (is_active, company_id);
CREATE INDEX idx_customers_balance ON customers (current_balance);

-- ========================================
-- DOCUMENT MANAGEMENT
-- ========================================

-- Document type enum
CREATE TYPE document_type AS ENUM (
    'invoice', 'quotation', 'proforma', 'receipt', 'packing_list', 
    'delivery_note', 'purchase_order', 'credit_note', 'debit_note', 
    'statement', 'goods_received_note', 'material_transfer_note'
);

-- Document templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type document_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    template_design JSONB, -- Store template design configuration
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for document templates
CREATE INDEX idx_templates_company ON document_templates (company_id);
CREATE INDEX idx_templates_type ON document_templates (document_type, company_id);
CREATE INDEX idx_templates_default ON document_templates (is_default, document_type, company_id);

-- Quotation status enum
CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted');

-- Quotations
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quote_number VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Dates
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Status
    status quotation_status DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP NULL,
    viewed_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_quotations_number UNIQUE (company_id, quote_number)
);

-- Create indexes for quotations
CREATE INDEX idx_quotations_company ON quotations (company_id);
CREATE INDEX idx_quotations_customer ON quotations (customer_id);
CREATE INDEX idx_quotations_number ON quotations (quote_number, company_id);
CREATE INDEX idx_quotations_status ON quotations (status, company_id);
CREATE INDEX idx_quotations_date ON quotations (issue_date);

-- Quotation items
CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Create indexes for quotation items
CREATE INDEX idx_quotation_items_quotation ON quotation_items (quotation_id);
CREATE INDEX idx_quotation_items_product ON quotation_items (product_id);

-- Proforma invoice status enum
CREATE TYPE proforma_status AS ENUM ('draft', 'sent', 'converted', 'expired', 'cancelled');

-- Proforma invoices
CREATE TABLE proforma_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    proforma_number VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Dates
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Status
    status proforma_status DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_proforma_number UNIQUE (company_id, proforma_number)
);

-- Create indexes for proforma invoices
CREATE INDEX idx_proforma_company ON proforma_invoices (company_id);
CREATE INDEX idx_proforma_customer ON proforma_invoices (customer_id);
CREATE INDEX idx_proforma_quotation ON proforma_invoices (quotation_id);
CREATE INDEX idx_proforma_number ON proforma_invoices (proforma_number, company_id);
CREATE INDEX idx_proforma_status ON proforma_invoices (status, company_id);

-- Proforma invoice items
CREATE TABLE proforma_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proforma_invoice_id UUID NOT NULL REFERENCES proforma_invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Create indexes for proforma invoice items
CREATE INDEX idx_proforma_items_proforma ON proforma_invoice_items (proforma_invoice_id);
CREATE INDEX idx_proforma_items_product ON proforma_invoice_items (product_id);

-- Invoice status enums
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overpaid');
CREATE TYPE etims_status AS ENUM ('pending', 'submitted', 'accepted', 'rejected');

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    proforma_invoice_id UUID REFERENCES proforma_invoices(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Status
    status invoice_status DEFAULT 'draft',
    payment_status payment_status DEFAULT 'unpaid',
    
    -- ETIMS Integration
    etims_status etims_status DEFAULT 'pending',
    etims_code VARCHAR(100),
    etims_response JSONB,
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_invoices_number UNIQUE (company_id, invoice_number)
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_company ON invoices (company_id);
CREATE INDEX idx_invoices_customer ON invoices (customer_id);
CREATE INDEX idx_invoices_number ON invoices (invoice_number, company_id);
CREATE INDEX idx_invoices_status ON invoices (status, company_id);
CREATE INDEX idx_invoices_payment_status ON invoices (payment_status, company_id);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);
CREATE INDEX idx_invoices_balance ON invoices (balance_due);

-- Invoice items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Create indexes for invoice items
CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items (product_id);

-- ========================================
-- PAYMENT MANAGEMENT
-- ========================================

-- Payment method and status enums
CREATE TYPE payment_method AS ENUM ('cash', 'mpesa', 'bank_transfer', 'cheque', 'card', 'other');
CREATE TYPE payment_status_type AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    payment_number VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method NOT NULL,
    reference_number VARCHAR(255),
    mpesa_transaction_id VARCHAR(100),
    cheque_number VARCHAR(50),
    bank_name VARCHAR(255),
    
    -- Status
    status payment_status_type DEFAULT 'completed',
    
    -- Details
    payment_date DATE NOT NULL,
    notes TEXT,
    attachments JSONB,
    
    -- Tracking
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payments
CREATE INDEX idx_payments_company ON payments (company_id);
CREATE INDEX idx_payments_customer ON payments (customer_id);
CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_date ON payments (payment_date);
CREATE INDEX idx_payments_method ON payments (payment_method);
CREATE INDEX idx_payments_status ON payments (status, company_id);

-- ========================================
-- SYSTEM TABLES
-- ========================================

-- Number sequence reset frequency enum
CREATE TYPE reset_frequency AS ENUM ('never', 'yearly', 'monthly');

-- Number sequences
CREATE TABLE number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sequence_type VARCHAR(50) NOT NULL,
    prefix VARCHAR(20),
    current_number INTEGER NOT NULL DEFAULT 1,
    padding_length INTEGER DEFAULT 3,
    reset_frequency reset_frequency DEFAULT 'never',
    last_reset_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_number_sequences_type UNIQUE (company_id, sequence_type)
);

-- Create indexes for number sequences
CREATE INDEX idx_number_sequences_company ON number_sequences (company_id);

-- Setting type enum
CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'array');

-- Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    setting_type setting_type DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_settings_key UNIQUE (company_id, setting_key)
);

-- Create indexes for settings
CREATE INDEX idx_settings_company ON settings (company_id);

-- Activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for activity logs
CREATE INDEX idx_activity_logs_company ON activity_logs (company_id);
CREATE INDEX idx_activity_logs_user ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);
CREATE INDEX idx_activity_logs_date ON activity_logs (created_at);

-- ========================================
-- PERFORMANCE OPTIMIZATIONS
-- ========================================

-- Create composite indexes for better query performance
CREATE INDEX idx_invoices_company_status_date ON invoices(company_id, status, issue_date);
CREATE INDEX idx_products_company_stock_status ON products(company_id, current_stock, status);
CREATE INDEX idx_payments_company_date_method ON payments(company_id, payment_date, payment_method);
CREATE INDEX idx_quotations_company_status_date ON quotations(company_id, status, issue_date);

-- Create views for common queries
CREATE VIEW outstanding_invoices AS
SELECT 
    i.*,
    c.name as customer_name,
    c.email as customer_email,
    (CURRENT_DATE - i.due_date) as days_overdue
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.balance_due > 0 
AND i.status NOT IN ('cancelled', 'paid');

CREATE VIEW low_stock_products AS
SELECT 
    p.*,
    pc.name as category_name,
    (p.min_stock - p.current_stock) as stock_shortage
FROM products p
LEFT JOIN product_categories pc ON p.category_id = pc.id
WHERE p.current_stock <= p.min_stock 
AND p.track_inventory = TRUE 
AND p.is_active = TRUE;

-- Analytics views
CREATE VIEW monthly_sales_summary AS
SELECT 
    i.company_id,
    EXTRACT(YEAR FROM i.issue_date) as year,
    EXTRACT(MONTH FROM i.issue_date) as month,
    COUNT(*) as invoice_count,
    SUM(i.total_amount) as total_sales,
    SUM(i.amount_paid) as total_collected,
    SUM(i.balance_due) as total_outstanding
FROM invoices i
WHERE i.status != 'cancelled'
GROUP BY i.company_id, EXTRACT(YEAR FROM i.issue_date), EXTRACT(MONTH FROM i.issue_date);

-- ========================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ========================================

-- Function to update invoice balance after payment
CREATE OR REPLACE FUNCTION update_invoice_balance_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_id IS NOT NULL THEN
        UPDATE invoices 
        SET 
            amount_paid = amount_paid + NEW.amount,
            balance_due = total_amount - (amount_paid + NEW.amount),
            payment_status = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN 'paid'::payment_status
                WHEN (amount_paid + NEW.amount) > 0 THEN 'partial'::payment_status
                ELSE 'unpaid'::payment_status
            END,
            status = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN 'paid'::invoice_status
                ELSE status
            END,
            paid_at = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN NOW()
                ELSE paid_at
            END,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer balance after invoice
CREATE OR REPLACE FUNCTION update_customer_balance_after_invoice()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE customers 
    SET 
        current_balance = current_balance + NEW.balance_due,
        updated_at = NOW()
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock after invoice item
CREATE OR REPLACE FUNCTION update_stock_after_invoice_item()
RETURNS TRIGGER AS $$
DECLARE
    prev_stock DECIMAL(15,3);
    new_stock DECIMAL(15,3);
    comp_id UUID;
    invoice_creator UUID;
BEGIN
    -- Get current stock and update it
    UPDATE products 
    SET 
        current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id
    RETURNING current_stock + NEW.quantity, current_stock INTO prev_stock, new_stock;
    
    -- Get company_id and created_by from invoice
    SELECT company_id, created_by INTO comp_id, invoice_creator
    FROM invoices WHERE id = NEW.invoice_id;
    
    -- Create stock movement record
    INSERT INTO stock_movements (
        company_id, product_id, movement_type, quantity, 
        previous_stock, new_stock, reference_type, reference_id, created_by
    )
    VALUES (
        comp_id,
        NEW.product_id,
        'out'::movement_type,
        NEW.quantity,
        prev_stock,
        new_stock,
        'sale'::reference_type,
        NEW.invoice_id,
        invoice_creator
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger for payment balance updates
CREATE TRIGGER trigger_update_invoice_balance_after_payment
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_balance_after_payment();

-- Trigger for customer balance updates
CREATE TRIGGER trigger_update_customer_balance_after_invoice
    AFTER INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_balance_after_invoice();

-- Trigger for stock updates
CREATE TRIGGER trigger_update_stock_after_invoice_item
    AFTER INSERT ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_after_invoice_item();

-- Auto-update timestamps triggers
CREATE TRIGGER trigger_update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_proforma_invoices_updated_at
    BEFORE UPDATE ON proforma_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
