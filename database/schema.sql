-- Business ERP System Database Schema
-- MySQL 8.0+ Compatible

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS business_erp;
CREATE DATABASE business_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE business_erp;

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_companies_active (is_active),
    INDEX idx_companies_kra_pin (kra_pin)
);

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
    last_login_at TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_users_company (company_id),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active, company_id)
);

-- ========================================
-- INVENTORY MANAGEMENT
-- ========================================

-- Product categories
CREATE TABLE product_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id CHAR(36) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    INDEX idx_categories_company (company_id),
    INDEX idx_categories_parent (parent_id),
    UNIQUE KEY uk_categories_company_name (company_id, name)
);

-- Suppliers
CREATE TABLE suppliers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    kra_pin VARCHAR(50),
    payment_terms INT DEFAULT 30,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_suppliers_company (company_id),
    INDEX idx_suppliers_active (is_active, company_id)
);

-- Products
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
    
    INDEX idx_products_company (company_id),
    INDEX idx_products_sku (company_id, sku),
    INDEX idx_products_barcode (barcode),
    INDEX idx_products_status (status, company_id),
    INDEX idx_products_stock (current_stock, min_stock),
    UNIQUE KEY uk_products_company_sku (company_id, sku)
);

-- Product variants
CREATE TABLE product_variants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    attributes JSON, -- Store variant attributes like color, size, etc.
    price DECIMAL(15,2),
    stock DECIMAL(15,3) DEFAULT 0.000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_variants_product (product_id),
    INDEX idx_variants_sku (sku),
    UNIQUE KEY uk_variants_sku (sku)
);

-- Stock movements
CREATE TABLE stock_movements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    movement_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    previous_stock DECIMAL(15,3) NOT NULL,
    new_stock DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2),
    reference_type ENUM('purchase', 'sale', 'adjustment', 'return', 'transfer', 'production'),
    reference_id CHAR(36),
    reference_number VARCHAR(100),
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_stock_movements_company (company_id),
    INDEX idx_stock_movements_product (product_id),
    INDEX idx_stock_movements_date (created_at),
    INDEX idx_stock_movements_reference (reference_type, reference_id)
);

-- ========================================
-- CUSTOMER MANAGEMENT
-- ========================================

-- Customers
CREATE TABLE customers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
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
    payment_terms INT DEFAULT 30,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    customer_type ENUM('individual', 'business') DEFAULT 'business',
    tax_exempt BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    tags JSON,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_customers_company (company_id),
    INDEX idx_customers_name (name),
    INDEX idx_customers_active (is_active, company_id),
    INDEX idx_customers_balance (current_balance)
);

-- ========================================
-- DOCUMENT MANAGEMENT
-- ========================================

-- Document templates
CREATE TABLE document_templates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type ENUM('invoice', 'quotation', 'proforma', 'receipt', 'packing_list', 'delivery_note', 'purchase_order', 'credit_note', 'debit_note', 'statement', 'goods_received_note', 'material_transfer_note') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    template_design JSON, -- Store template design configuration
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_templates_company (company_id),
    INDEX idx_templates_type (document_type, company_id),
    INDEX idx_templates_default (is_default, document_type, company_id)
);

-- Quotations
CREATE TABLE quotations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
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
    status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by CHAR(36),
    sent_at TIMESTAMP NULL,
    viewed_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_quotations_company (company_id),
    INDEX idx_quotations_customer (customer_id),
    INDEX idx_quotations_number (quote_number, company_id),
    INDEX idx_quotations_status (status, company_id),
    INDEX idx_quotations_date (issue_date),
    UNIQUE KEY uk_quotations_number (company_id, quote_number)
);

-- Quotation items
CREATE TABLE quotation_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    quotation_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_quotation_items_quotation (quotation_id),
    INDEX idx_quotation_items_product (product_id)
);

-- Proforma invoices
CREATE TABLE proforma_invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    quotation_id CHAR(36),
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
    status ENUM('draft', 'sent', 'converted', 'expired', 'cancelled') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by CHAR(36),
    sent_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_proforma_company (company_id),
    INDEX idx_proforma_customer (customer_id),
    INDEX idx_proforma_quotation (quotation_id),
    INDEX idx_proforma_number (proforma_number, company_id),
    INDEX idx_proforma_status (status, company_id),
    UNIQUE KEY uk_proforma_number (company_id, proforma_number)
);

-- Proforma invoice items
CREATE TABLE proforma_invoice_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    proforma_invoice_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (proforma_invoice_id) REFERENCES proforma_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_proforma_items_proforma (proforma_invoice_id),
    INDEX idx_proforma_items_product (product_id)
);

-- Invoices
CREATE TABLE invoices (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    quotation_id CHAR(36),
    proforma_invoice_id CHAR(36),
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
    status ENUM('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid',
    
    -- ETIMS Integration
    etims_status ENUM('pending', 'submitted', 'accepted', 'rejected') DEFAULT 'pending',
    etims_code VARCHAR(100),
    etims_response JSON,
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Tracking
    created_by CHAR(36),
    sent_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
    FOREIGN KEY (proforma_invoice_id) REFERENCES proforma_invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_invoices_company (company_id),
    INDEX idx_invoices_customer (customer_id),
    INDEX idx_invoices_number (invoice_number, company_id),
    INDEX idx_invoices_status (status, company_id),
    INDEX idx_invoices_payment_status (payment_status, company_id),
    INDEX idx_invoices_due_date (due_date),
    INDEX idx_invoices_balance (balance_due),
    UNIQUE KEY uk_invoices_number (company_id, invoice_number)
);

-- Invoice items
CREATE TABLE invoice_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    invoice_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    sort_order INT DEFAULT 0,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_invoice_items_invoice (invoice_id),
    INDEX idx_invoice_items_product (product_id)
);

-- ========================================
-- PAYMENT MANAGEMENT
-- ========================================

-- Payments
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_id CHAR(36),
    payment_number VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'mpesa', 'bank_transfer', 'cheque', 'card', 'other') NOT NULL,
    reference_number VARCHAR(255),
    mpesa_transaction_id VARCHAR(100),
    cheque_number VARCHAR(50),
    bank_name VARCHAR(255),
    
    -- Status
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    
    -- Details
    payment_date DATE NOT NULL,
    notes TEXT,
    attachments JSON,
    
    -- Tracking
    created_by CHAR(36),
    verified_by CHAR(36),
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_payments_company (company_id),
    INDEX idx_payments_customer (customer_id),
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_date (payment_date),
    INDEX idx_payments_method (payment_method),
    INDEX idx_payments_status (status, company_id)
);

-- ========================================
-- LOGISTICS AND FULFILLMENT
-- ========================================

-- Packing lists
CREATE TABLE packing_lists (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_id CHAR(36),
    packing_number VARCHAR(100) NOT NULL,
    
    -- Details
    total_quantity DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    total_packages INT DEFAULT 1,
    total_weight DECIMAL(10,3),
    dimensions VARCHAR(255),
    
    -- Dates
    packing_date DATE NOT NULL,
    shipped_date DATE,
    
    -- Status
    status ENUM('draft', 'packed', 'shipped', 'delivered') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    special_instructions TEXT,
    
    -- Tracking
    created_by CHAR(36),
    packed_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (packed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_packing_lists_company (company_id),
    INDEX idx_packing_lists_customer (customer_id),
    INDEX idx_packing_lists_invoice (invoice_id),
    INDEX idx_packing_lists_number (packing_number, company_id),
    UNIQUE KEY uk_packing_lists_number (company_id, packing_number)
);

-- Packing list items
CREATE TABLE packing_list_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    packing_list_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    quantity DECIMAL(15,3) NOT NULL,
    package_type VARCHAR(100),
    package_quantity INT DEFAULT 1,
    weight DECIMAL(10,3),
    serial_numbers JSON,
    batch_numbers JSON,
    notes TEXT,
    
    FOREIGN KEY (packing_list_id) REFERENCES packing_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_packing_list_items_list (packing_list_id),
    INDEX idx_packing_list_items_product (product_id)
);

-- Delivery notes
CREATE TABLE delivery_notes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_id CHAR(36),
    packing_list_id CHAR(36),
    delivery_number VARCHAR(100) NOT NULL,
    
    -- Delivery details
    delivery_address TEXT NOT NULL,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Logistics
    driver_name VARCHAR(255),
    vehicle_number VARCHAR(50),
    delivery_date DATE NOT NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Status
    status ENUM('draft', 'in_transit', 'delivered', 'returned', 'cancelled') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    delivery_instructions TEXT,
    signature_url VARCHAR(500),
    
    -- Tracking
    created_by CHAR(36),
    delivered_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (packing_list_id) REFERENCES packing_lists(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (delivered_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_delivery_notes_company (company_id),
    INDEX idx_delivery_notes_customer (customer_id),
    INDEX idx_delivery_notes_number (delivery_number, company_id),
    INDEX idx_delivery_notes_date (delivery_date),
    UNIQUE KEY uk_delivery_notes_number (company_id, delivery_number)
);

-- Delivery note items
CREATE TABLE delivery_note_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    delivery_note_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    quantity_ordered DECIMAL(15,3) NOT NULL,
    quantity_delivered DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    condition_status ENUM('good', 'damaged', 'missing') DEFAULT 'good',
    notes TEXT,
    
    FOREIGN KEY (delivery_note_id) REFERENCES delivery_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_delivery_note_items_note (delivery_note_id),
    INDEX idx_delivery_note_items_product (product_id)
);

-- ========================================
-- PURCHASE MANAGEMENT
-- ========================================

-- Purchase orders
CREATE TABLE purchase_orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    po_number VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Dates
    order_date DATE NOT NULL,
    expected_date DATE,
    received_date DATE,
    
    -- Status
    status ENUM('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    terms_conditions TEXT,
    
    -- Tracking
    created_by CHAR(36),
    approved_by CHAR(36),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_purchase_orders_company (company_id),
    INDEX idx_purchase_orders_supplier (supplier_id),
    INDEX idx_purchase_orders_number (po_number, company_id),
    INDEX idx_purchase_orders_status (status, company_id),
    UNIQUE KEY uk_purchase_orders_number (company_id, po_number)
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    purchase_order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    description TEXT,
    quantity_ordered DECIMAL(15,3) NOT NULL,
    quantity_received DECIMAL(15,3) DEFAULT 0.000,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    line_total DECIMAL(15,2) NOT NULL,
    
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_po_items_po (purchase_order_id),
    INDEX idx_po_items_product (product_id)
);

-- Goods received notes
CREATE TABLE goods_received_notes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    supplier_id CHAR(36) NOT NULL,
    purchase_order_id CHAR(36),
    grn_number VARCHAR(100) NOT NULL,
    
    -- Details
    total_quantity DECIMAL(15,3) NOT NULL DEFAULT 0.000,
    
    -- Dates
    received_date DATE NOT NULL,
    inspected_date DATE,
    
    -- Status
    status ENUM('draft', 'received', 'inspected', 'accepted', 'rejected') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    rejection_reason TEXT,
    
    -- Tracking
    received_by CHAR(36),
    inspected_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (inspected_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_grn_company (company_id),
    INDEX idx_grn_supplier (supplier_id),
    INDEX idx_grn_po (purchase_order_id),
    INDEX idx_grn_number (grn_number, company_id),
    UNIQUE KEY uk_grn_number (company_id, grn_number)
);

-- ========================================
-- FINANCIAL DOCUMENTS
-- ========================================

-- Credit notes
CREATE TABLE credit_notes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    invoice_id CHAR(36),
    credit_number VARCHAR(100) NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    vat_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Details
    issue_date DATE NOT NULL,
    reason TEXT NOT NULL,
    
    -- Status
    status ENUM('draft', 'issued', 'applied') DEFAULT 'draft',
    
    -- Content
    notes TEXT,
    
    -- Tracking
    created_by CHAR(36),
    issued_at TIMESTAMP NULL,
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_credit_notes_company (company_id),
    INDEX idx_credit_notes_customer (customer_id),
    INDEX idx_credit_notes_invoice (invoice_id),
    INDEX idx_credit_notes_number (credit_number, company_id),
    UNIQUE KEY uk_credit_notes_number (company_id, credit_number)
);

-- Credit note items
CREATE TABLE credit_note_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    credit_note_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    description TEXT,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 16.00,
    line_total DECIMAL(15,2) NOT NULL,
    
    FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    
    INDEX idx_credit_note_items_note (credit_note_id),
    INDEX idx_credit_note_items_product (product_id)
);

-- ========================================
-- SYSTEM TABLES
-- ========================================

-- Activity logs
CREATE TABLE activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id CHAR(36),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_activity_logs_company (company_id),
    INDEX idx_activity_logs_user (user_id),
    INDEX idx_activity_logs_entity (entity_type, entity_id),
    INDEX idx_activity_logs_date (created_at)
);

-- Number sequences
CREATE TABLE number_sequences (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    sequence_type VARCHAR(50) NOT NULL,
    prefix VARCHAR(20),
    current_number INT NOT NULL DEFAULT 1,
    padding_length INT DEFAULT 3,
    reset_frequency ENUM('never', 'yearly', 'monthly') DEFAULT 'never',
    last_reset_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_number_sequences_company (company_id),
    UNIQUE KEY uk_number_sequences_type (company_id, sequence_type)
);

-- Settings
CREATE TABLE settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    company_id CHAR(36) NOT NULL,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSON,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    
    INDEX idx_settings_company (company_id),
    UNIQUE KEY uk_settings_key (company_id, setting_key)
);

-- ========================================
-- SEED DATA
-- ========================================

-- Insert default company
INSERT INTO companies (id, name, kra_pin, address_line1, city, country, phone, email, currency) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Crestview General Merchants',
    'P051234567A',
    'P.O Box 12345',
    'Nairobi',
    'Kenya',
    '+254700123456',
    'info@crestview.co.ke',
    'KES'
);

-- Insert default admin user
INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'System',
    'Administrator',
    'admin@crestview.co.ke',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'admin',
    TRUE
);

-- Insert default number sequences
INSERT INTO number_sequences (company_id, sequence_type, prefix, current_number) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'invoice', 'INV', 1),
('550e8400-e29b-41d4-a716-446655440000', 'quotation', 'QUO', 1),
('550e8400-e29b-41d4-a716-446655440000', 'proforma', 'PRO', 1),
('550e8400-e29b-41d4-a716-446655440000', 'purchase_order', 'PO', 1),
('550e8400-e29b-41d4-a716-446655440000', 'credit_note', 'CRN', 1),
('550e8400-e29b-41d4-a716-446655440000', 'delivery_note', 'DEL', 1),
('550e8400-e29b-41d4-a716-446655440000', 'packing_list', 'PKG', 1);

-- Insert sample product categories
INSERT INTO product_categories (id, company_id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Electronics', 'Electronic devices and accessories'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Furniture', 'Office and home furniture'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Medical Supplies', 'Medical equipment and supplies'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Office Supplies', 'General office supplies and stationery');

SET FOREIGN_KEY_CHECKS = 1;

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
    DATEDIFF(CURDATE(), i.due_date) as days_overdue
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
    YEAR(i.issue_date) as year,
    MONTH(i.issue_date) as month,
    COUNT(*) as invoice_count,
    SUM(i.total_amount) as total_sales,
    SUM(i.amount_paid) as total_collected,
    SUM(i.balance_due) as total_outstanding
FROM invoices i
WHERE i.status != 'cancelled'
GROUP BY i.company_id, YEAR(i.issue_date), MONTH(i.issue_date);

-- ========================================
-- TRIGGERS FOR BUSINESS LOGIC
-- ========================================

DELIMITER //

-- Update invoice balance when payments are made
CREATE TRIGGER update_invoice_balance_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.invoice_id IS NOT NULL THEN
        UPDATE invoices 
        SET 
            amount_paid = amount_paid + NEW.amount,
            balance_due = total_amount - (amount_paid + NEW.amount),
            payment_status = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN 'paid'
                WHEN (amount_paid + NEW.amount) > 0 THEN 'partial'
                ELSE 'unpaid'
            END,
            status = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN 'paid'
                ELSE status
            END,
            paid_at = CASE 
                WHEN (amount_paid + NEW.amount) >= total_amount THEN NOW()
                ELSE paid_at
            END
        WHERE id = NEW.invoice_id;
    END IF;
END//

-- Update customer balance
CREATE TRIGGER update_customer_balance_after_invoice
AFTER INSERT ON invoices
FOR EACH ROW
BEGIN
    UPDATE customers 
    SET current_balance = current_balance + NEW.balance_due
    WHERE id = NEW.customer_id;
END//

-- Update stock when products are sold
CREATE TRIGGER update_stock_after_invoice_item
AFTER INSERT ON invoice_items
FOR EACH ROW
BEGIN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Create stock movement record
    INSERT INTO stock_movements (
        company_id, product_id, movement_type, quantity, 
        previous_stock, new_stock, reference_type, reference_id, created_by
    )
    SELECT 
        (SELECT company_id FROM invoices WHERE id = NEW.invoice_id),
        NEW.product_id,
        'out',
        NEW.quantity,
        current_stock + NEW.quantity,
        current_stock,
        'sale',
        NEW.invoice_id,
        (SELECT created_by FROM invoices WHERE id = NEW.invoice_id)
    FROM products 
    WHERE id = NEW.product_id;
END//

DELIMITER ;

-- End of schema
