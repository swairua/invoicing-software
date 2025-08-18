-- Business ERP System Database Schema
-- MySQL 8.0+ Compatible
-- Migration: 001_initial_schema.sql

-- ========================================
-- CORE SYSTEM TABLES
-- ========================================

-- Companies table (Multi-tenant support)
CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for companies
CREATE INDEX idx_companies_active ON companies (is_active);
CREATE INDEX idx_companies_kra_pin ON companies (kra_pin);

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'sales', 'accountant', 'viewer', 'manager') DEFAULT 'viewer',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create indexes for users
CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_active ON users (is_active);

-- Customers table
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    kra_pin VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    payment_terms INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create indexes for customers
CREATE INDEX idx_customers_company ON customers (company_id);
CREATE INDEX idx_customers_email ON customers (email);
CREATE INDEX idx_customers_active ON customers (is_active);

-- Suppliers table
CREATE TABLE suppliers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    kra_pin VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    payment_terms INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create indexes for suppliers
CREATE INDEX idx_suppliers_company ON suppliers (company_id);
CREATE INDEX idx_suppliers_active ON suppliers (is_active);

-- Product categories table
CREATE TABLE product_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id CHAR(36),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    UNIQUE KEY uk_categories_company_name (company_id, name)
);

-- Create indexes for product categories
CREATE INDEX idx_categories_company ON product_categories (company_id);
CREATE INDEX idx_categories_parent ON product_categories (parent_id);

-- Products table
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    supplier_id CHAR(36),
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
    status ENUM('active', 'inactive', 'discontinued', 'out_of_stock') DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    tags JSON,
    images JSON,
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_products_company_sku (company_id, sku)
);

-- Create indexes for products
CREATE INDEX idx_products_company ON products (company_id);
CREATE INDEX idx_products_sku ON products (company_id, sku);
CREATE INDEX idx_products_barcode ON products (barcode);
CREATE INDEX idx_products_status ON products (status, company_id);
CREATE INDEX idx_products_stock ON products (current_stock, min_stock);

-- Product variants table
CREATE TABLE product_variants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    attributes JSON,
    price DECIMAL(15,2),
    stock DECIMAL(15,3) DEFAULT 0.000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_variants_sku (sku)
);

-- Create indexes for product variants
CREATE INDEX idx_variants_product ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);

-- Stock movements table
CREATE TABLE stock_movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    movement_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    previous_stock DECIMAL(15,3) NOT NULL,
    new_stock DECIMAL(15,3) NOT NULL,
    reference_type ENUM('purchase', 'sale', 'adjustment', 'return', 'transfer', 'production'),
    reference_id CHAR(36),
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for stock movements
CREATE INDEX idx_stock_movements_company ON stock_movements (company_id);
CREATE INDEX idx_stock_movements_product ON stock_movements (product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements (created_at);

-- Tax configurations table
CREATE TABLE tax_configurations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    is_compound BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY uk_tax_config_company_code (company_id, code)
);

-- Create indexes for tax configurations
CREATE INDEX idx_tax_config_company ON tax_configurations (company_id);
CREATE INDEX idx_tax_config_active ON tax_configurations (is_active);

-- Invoices table
CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Status and metadata
    status ENUM('draft', 'pending', 'sent', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid',
    
    -- Additional fields
    notes TEXT,
    terms TEXT,
    footer TEXT,
    internal_notes TEXT,
    
    -- ETIMS integration
    etims_status ENUM('not_submitted', 'submitted', 'approved', 'rejected') DEFAULT 'not_submitted',
    etims_invoice_number VARCHAR(100),
    etims_control_unit_number VARCHAR(100),
    etims_receipt_signature VARCHAR(500),
    
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_invoices_company_number (company_id, invoice_number)
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_company ON invoices (company_id);
CREATE INDEX idx_invoices_customer ON invoices (customer_id);
CREATE INDEX idx_invoices_status ON invoices (status);
CREATE INDEX idx_invoices_date ON invoices (issue_date);
CREATE INDEX idx_invoices_due_date ON invoices (due_date);

-- Invoice items table
CREATE TABLE invoice_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id CHAR(36) NOT NULL,
    product_id CHAR(36),
    variant_id CHAR(36),
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Create indexes for invoice items
CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items (product_id);

-- Payments table
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_id CHAR(36),
    payment_number VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'mpesa', 'paypal', 'other') NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_payments_company_number (company_id, payment_number)
);

-- Create indexes for payments
CREATE INDEX idx_payments_company ON payments (company_id);
CREATE INDEX idx_payments_customer ON payments (customer_id);
CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_date ON payments (payment_date);

-- Insert default company for testing
INSERT INTO companies (id, name, kra_pin, address_line1, city, country, phone, email, currency, vat_rate, invoice_prefix) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Demo Company Ltd',
    'P051234567M',
    '123 Business Street',
    'Nairobi',
    'Kenya',
    '+254700123456',
    'info@democompany.co.ke',
    'KES',
    16.00,
    'INV'
);

-- Insert default admin user
INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin',
    'User',
    'admin@democompany.co.ke',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'admin'
);
