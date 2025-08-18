-- Seed Data Migration
-- PostgreSQL 14+ Compatible
-- Migration: 002_seed_data.sql

-- ========================================
-- SEED DATA
-- ========================================

-- Insert default company
INSERT INTO companies (id, name, kra_pin, address_line1, city, country, phone, email, currency) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Crestview General Merchants',
    'P051234567A',
    'P.O Box 12345',
    'Nairobi',
    'Kenya',
    '+254700123456',
    'info@crestview.co.ke',
    'KES'
);

-- Insert default admin user (password: password)
INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'System',
    'Administrator',
    'admin@crestview.co.ke',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'::user_role,
    TRUE
);

-- Insert sales user
INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'John',
    'Salesperson',
    'sales@crestview.co.ke',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'sales'::user_role,
    TRUE
);

-- Insert number sequences
INSERT INTO number_sequences (company_id, sequence_type, prefix, current_number) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'invoice', 'INV', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'quotation', 'QUO', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'proforma', 'PRO', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'purchase_order', 'PO', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'credit_note', 'CRN', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'delivery_note', 'DEL', 1),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'packing_list', 'PKG', 1);

-- Insert sample product categories
INSERT INTO product_categories (id, company_id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Electronics', 'Electronic devices and accessories'),
('550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Furniture', 'Office and home furniture'),
('550e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Medical Supplies', 'Medical equipment and supplies'),
('550e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Office Supplies', 'General office supplies and stationery');

-- Insert suppliers
INSERT INTO suppliers (id, company_id, name, contact_person, email, phone, address, kra_pin) VALUES
('550e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Medical Supplies International', 'Dr. James Mwangi', 'orders@medisupplies.com', '+254700555666', 'Industrial Area, Nairobi', 'P051234580E'),
('550e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Office Furniture Solutions', 'Mary Wanjiku', 'sales@officefurniture.co.ke', '+254722333444', 'Mombasa Road, Nairobi', 'P051234581F'),
('550e8400-e29b-41d4-a716-446655440022'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Tech Distributors Ltd', 'Peter Kiprotich', 'info@techdist.co.ke', '+254733888999', 'Westlands, Nairobi', 'P051234582G');

-- Insert sample products
INSERT INTO products (
    id, company_id, category_id, supplier_id, name, description, sku, barcode, brand,
    unit_of_measure, purchase_price, selling_price, wholesale_price, retail_price,
    current_stock, min_stock, max_stock, reorder_level, location, bin_location,
    is_taxable, tax_rate, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440030'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    '550e8400-e29b-41d4-a716-446655440020'::uuid,
    'Latex Rubber Gloves Bicolor Reusable XL',
    'High-quality latex rubber gloves for medical and industrial use',
    'LRG-001',
    '1234567890123',
    'MediSafe',
    'Pair',
    400.00,
    500.00,
    450.00,
    500.00,
    450.000,
    50.000,
    1000.000,
    100.000,
    'Warehouse A',
    'A-1-001',
    FALSE,
    0.00,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440031'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440011'::uuid,
    '550e8400-e29b-41d4-a716-446655440021'::uuid,
    'Executive Office Chair with Lumbar Support',
    'Ergonomic executive chair with adjustable lumbar support and armrests',
    'EOC-002',
    '2345678901234',
    'ComfortDesk',
    'piece',
    12000.00,
    18000.00,
    15000.00,
    18000.00,
    12.000,
    5.000,
    50.000,
    8.000,
    'Warehouse B',
    'B-2-005',
    TRUE,
    16.00,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440032'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    '550e8400-e29b-41d4-a716-446655440020'::uuid,
    'Digital Blood Pressure Monitor',
    'Automatic digital blood pressure monitor with memory function',
    'DBP-003',
    '3456789012345',
    'HealthTech',
    'piece',
    4500.00,
    6500.00,
    5800.00,
    6500.00,
    35.000,
    10.000,
    100.000,
    15.000,
    'Warehouse A',
    'A-3-012',
    FALSE,
    0.00,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440033'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    '550e8400-e29b-41d4-a716-446655440022'::uuid,
    'Wireless Bluetooth Headphones',
    'Premium wireless headphones with noise cancellation',
    'WBH-004',
    '4567890123456',
    'SoundMax',
    'piece',
    3500.00,
    5500.00,
    4800.00,
    5500.00,
    85.000,
    20.000,
    200.000,
    30.000,
    'Warehouse C',
    'C-1-008',
    TRUE,
    16.00,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440034'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    '550e8400-e29b-41d4-a716-446655440020'::uuid,
    'Surgical Face Masks (Box of 50)',
    '3-layer disposable surgical face masks, medical grade',
    'SFM-005',
    '5678901234567',
    'MediSafe',
    'Box',
    800.00,
    1200.00,
    1000.00,
    1200.00,
    45.000,
    100.000,
    2000.000,
    50.000,
    'Warehouse A',
    'A-1-015',
    FALSE,
    0.00,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert product variants for headphones
INSERT INTO product_variants (id, product_id, name, sku, attributes, price, stock) VALUES
('550e8400-e29b-41d4-a716-446655440040'::uuid, '550e8400-e29b-41d4-a716-446655440033'::uuid, 'Black', 'WBH-004-BK', '{"color": "Black"}', 5500.00, 50.000),
('550e8400-e29b-41d4-a716-446655440041'::uuid, '550e8400-e29b-41d4-a716-446655440033'::uuid, 'White', 'WBH-004-WH', '{"color": "White"}', 5500.00, 35.000);

-- Insert product variants for gloves
INSERT INTO product_variants (id, product_id, name, sku, attributes, price, stock) VALUES
('550e8400-e29b-41d4-a716-446655440042'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, 'Size S', 'LRG-001-S', '{"size": "Small"}', 480.00, 100.000),
('550e8400-e29b-41d4-a716-446655440043'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, 'Size M', 'LRG-001-M', '{"size": "Medium"}', 490.00, 150.000),
('550e8400-e29b-41d4-a716-446655440044'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, 'Size L', 'LRG-001-L', '{"size": "Large"}', 500.00, 120.000),
('550e8400-e29b-41d4-a716-446655440045'::uuid, '550e8400-e29b-41d4-a716-446655440030'::uuid, 'Size XL', 'LRG-001-XL', '{"size": "Extra Large"}', 520.00, 80.000);

-- Insert customers
INSERT INTO customers (
    id, company_id, customer_number, name, contact_person, email, phone, kra_pin,
    billing_address, city, credit_limit, payment_terms, customer_type, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440050'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'CUST-001',
    'Acme Corporation Ltd',
    'Jane Doe',
    'procurement@acme.com',
    '+254700123456',
    'P051234567A',
    'P.O Box 12345, Nairobi Kenya',
    'Nairobi',
    500000.00,
    30,
    'business'::customer_type,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440051'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'CUST-002',
    'Tech Solutions Kenya Ltd',
    'Michael Kiprop',
    'info@techsolutions.co.ke',
    '+254722987654',
    'P051234568B',
    '456 Innovation Hub, Nairobi',
    'Nairobi',
    300000.00,
    30,
    'business'::customer_type,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440052'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'CUST-003',
    'Safaricom PLC',
    'Grace Wanjiru',
    'supplier@safaricom.co.ke',
    '+254700000000',
    'P051234569C',
    'Safaricom House, Waiyaki Way',
    'Nairobi',
    1000000.00,
    30,
    'business'::customer_type,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440053'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'CUST-004',
    'Kenya Medical Centre',
    'Dr. Sarah Kimani',
    'procurement@kmc.co.ke',
    '+254733111222',
    'P051234570D',
    'Upper Hill, Nairobi',
    'Nairobi',
    750000.00,
    30,
    'business'::customer_type,
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert sample quotations
INSERT INTO quotations (
    id, company_id, customer_id, quote_number, subtotal, vat_amount, total_amount,
    issue_date, valid_until, status, notes, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440060'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440050'::uuid,
    'QUO-2024-001',
    25000.00,
    0.00,
    25000.00,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    'sent'::quotation_status,
    'Bulk order discount available for 100+ pieces',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440061'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440051'::uuid,
    'QUO-2024-002',
    90000.00,
    14400.00,
    99900.00,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'accepted'::quotation_status,
    'Installation and setup included in price',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert quotation items
INSERT INTO quotation_items (
    quotation_id, product_id, description, quantity, unit_price, vat_rate, vat_amount, line_total
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440060'::uuid,
    '550e8400-e29b-41d4-a716-446655440030'::uuid,
    'Latex Rubber Gloves Bicolor Reusable XL',
    50.000,
    500.00,
    0.00,
    0.00,
    25000.00
),
(
    '550e8400-e29b-41d4-a716-446655440061'::uuid,
    '550e8400-e29b-41d4-a716-446655440031'::uuid,
    'Executive Office Chair with Lumbar Support',
    5.000,
    18000.00,
    16.00,
    14400.00,
    104400.00
);

-- Insert sample proforma invoices
INSERT INTO proforma_invoices (
    id, company_id, customer_id, quotation_id, proforma_number, subtotal, vat_amount, total_amount,
    issue_date, valid_until, status, notes, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440070'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440052'::uuid,
    NULL,
    'PRO-2024-001',
    65000.00,
    0.00,
    65000.00,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '27 days',
    'sent'::proforma_status,
    'Medical equipment - VAT exempt',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert proforma invoice items
INSERT INTO proforma_invoice_items (
    proforma_invoice_id, product_id, description, quantity, unit_price, vat_rate, vat_amount, line_total
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440070'::uuid,
    '550e8400-e29b-41d4-a716-446655440032'::uuid,
    'Digital Blood Pressure Monitor',
    10.000,
    6500.00,
    0.00,
    0.00,
    65000.00
);

-- Insert sample invoices
INSERT INTO invoices (
    id, company_id, customer_id, invoice_number, subtotal, vat_amount, total_amount,
    amount_paid, balance_due, issue_date, due_date, status, payment_status,
    etims_status, etims_code, notes, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440080'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440050'::uuid,
    'INV-2024-001',
    12000.00,
    0.00,
    12000.00,
    12000.00,
    0.00,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'paid'::invoice_status,
    'paid'::payment_status,
    'accepted'::etims_status,
    'ETIMS-001-2024',
    'Payment received via M-Pesa',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440081'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440053'::uuid,
    'INV-2024-002',
    24000.00,
    0.00,
    24000.00,
    12000.00,
    12000.00,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '27 days',
    'partial'::invoice_status,
    'partial'::payment_status,
    'accepted'::etims_status,
    'ETIMS-002-2024',
    'Partial payment received, balance due',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert invoice items
INSERT INTO invoice_items (
    invoice_id, product_id, description, quantity, unit_price, vat_rate, vat_amount, line_total
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440080'::uuid,
    '550e8400-e29b-41d4-a716-446655440030'::uuid,
    'Latex Rubber Gloves Bicolor Reusable XL',
    24.000,
    500.00,
    0.00,
    0.00,
    12000.00
),
(
    '550e8400-e29b-41d4-a716-446655440081'::uuid,
    '550e8400-e29b-41d4-a716-446655440034'::uuid,
    'Surgical Face Masks (Box of 50)',
    20.000,
    1200.00,
    0.00,
    0.00,
    24000.00
);

-- Insert sample payments
INSERT INTO payments (
    id, company_id, customer_id, invoice_id, payment_number, amount, payment_method,
    reference_number, payment_date, notes, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440090'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440050'::uuid,
    '550e8400-e29b-41d4-a716-446655440080'::uuid,
    'PAY-2024-001',
    12000.00,
    'mpesa'::payment_method,
    'QK81P2X9M',
    CURRENT_DATE - INTERVAL '4 days',
    'Full payment for INV-2024-001',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440091'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440053'::uuid,
    '550e8400-e29b-41d4-a716-446655440081'::uuid,
    'PAY-2024-002',
    12000.00,
    'bank_transfer'::payment_method,
    'BT20240123001',
    CURRENT_DATE - INTERVAL '2 days',
    'Partial payment for INV-2024-002',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert some stock movements
INSERT INTO stock_movements (
    company_id, product_id, movement_type, quantity, previous_stock, new_stock,
    reference_type, reference_id, notes, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440030'::uuid,
    'out'::movement_type,
    24.000,
    474.000,
    450.000,
    'sale'::reference_type,
    '550e8400-e29b-41d4-a716-446655440080'::uuid,
    'Sale - INV-2024-001',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440034'::uuid,
    'out'::movement_type,
    20.000,
    65.000,
    45.000,
    'sale'::reference_type,
    '550e8400-e29b-41d4-a716-446655440081'::uuid,
    'Sale - INV-2024-002',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Insert document templates
INSERT INTO document_templates (
    id, company_id, name, description, document_type, is_active, is_default,
    template_design, created_by
) VALUES
(
    '550e8400-e29b-41d4-a716-4466554400a0'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Standard Invoice Template',
    'Default invoice template with company branding',
    'invoice'::document_type,
    TRUE,
    TRUE,
    '{"layout": "standard", "colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"heading": "Arial", "body": "Arial"}}',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-4466554400a1'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Standard Quotation Template',
    'Default quotation template with company branding',
    'quotation'::document_type,
    TRUE,
    TRUE,
    '{"layout": "standard", "colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"heading": "Arial", "body": "Arial"}}',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
),
(
    '550e8400-e29b-41d4-a716-4466554400a2'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Standard Proforma Template',
    'Default proforma invoice template with company branding',
    'proforma'::document_type,
    TRUE,
    TRUE,
    '{"layout": "standard", "colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"heading": "Arial", "body": "Arial"}}',
    '550e8400-e29b-41d4-a716-446655440001'::uuid
);

-- Update number sequences to reflect created documents
UPDATE number_sequences SET current_number = 3 WHERE sequence_type = 'invoice';
UPDATE number_sequences SET current_number = 3 WHERE sequence_type = 'quotation';
UPDATE number_sequences SET current_number = 2 WHERE sequence_type = 'proforma';

-- Insert some activity logs
INSERT INTO activity_logs (
    company_id, user_id, action, entity_type, entity_id, description
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'create',
    'invoice',
    '550e8400-e29b-41d4-a716-446655440080'::uuid,
    'Created invoice INV-2024-001 for Acme Corporation Ltd'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'payment_received',
    'payment',
    '550e8400-e29b-41d4-a716-446655440090'::uuid,
    'Payment of KES 12,000 received from Acme Corporation Ltd'
),
(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'create',
    'quotation',
    '550e8400-e29b-41d4-a716-446655440060'::uuid,
    'Created quotation QUO-2024-001 for Acme Corporation Ltd'
);

-- Insert some system settings
INSERT INTO settings (company_id, setting_key, setting_value, setting_type) VALUES
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'currency', '"KES"', 'string'),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'vat_rate', '16.00', 'number'),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'invoice_terms', '"Payment due within 30 days"', 'string'),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'company_logo', '"https://via.placeholder.com/200x80/1f2937/ffffff?text=CRESTVIEW"', 'string'),
('550e8400-e29b-41d4-a716-446655440000'::uuid, 'auto_send_invoices', 'false', 'boolean');
