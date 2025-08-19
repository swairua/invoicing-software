#!/usr/bin/env node

/**
 * Add Proforma Invoices Table
 * Creates the missing proforma_invoices table and related structures
 */

import mysql from "mysql2/promise";

async function createProformasTable() {
  console.log("🔧 Creating proforma_invoices table...\n");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "defaultdb",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("✅ Connected to database");

    // Create proforma_invoices table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS proforma_invoices (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        company_id VARCHAR(36) NOT NULL,
        customer_id VARCHAR(36) NOT NULL,
        proforma_number VARCHAR(50) NOT NULL,
        status ENUM('draft', 'sent', 'expired', 'converted') DEFAULT 'draft',
        issue_date DATE NOT NULL,
        valid_until DATE NOT NULL,
        subtotal DECIMAL(15,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) DEFAULT 0,
        notes TEXT,
        terms_and_conditions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_company_customer (company_id, customer_id),
        INDEX idx_proforma_number (proforma_number),
        INDEX idx_status (status),
        INDEX idx_dates (issue_date, valid_until),
        
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableSQL);
    console.log("✅ proforma_invoices table created successfully");

    // Create proforma_invoice_items table
    const createItemsTableSQL = `
      CREATE TABLE IF NOT EXISTS proforma_invoice_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        proforma_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(15,2) NOT NULL,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        line_total DECIMAL(15,2) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_proforma (proforma_id),
        INDEX idx_product (product_id),
        
        FOREIGN KEY (proforma_id) REFERENCES proforma_invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createItemsTableSQL);
    console.log("✅ proforma_invoice_items table created successfully");

    // Insert some sample proforma data
    const sampleProformaSQL = `
      INSERT IGNORE INTO proforma_invoices (
        id, company_id, customer_id, proforma_number, status, 
        issue_date, valid_until, subtotal, tax_amount, total_amount, notes
      ) VALUES 
      (
        'pf001-7c1a-11f0-a984-365070d15890',
        '00000000-0000-0000-0000-000000000001',
        (SELECT id FROM customers LIMIT 1),
        'PF-2025-001',
        'sent',
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 30 DAY),
        85000.00,
        13600.00,
        98600.00,
        'Standard medical supplies proforma invoice'
      ),
      (
        'pf002-7c1a-11f0-a984-365070d15890',
        '00000000-0000-0000-0000-000000000001',
        (SELECT id FROM customers ORDER BY id LIMIT 1 OFFSET 1),
        'PF-2025-002',
        'draft',
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 15 DAY),
        25000.00,
        4000.00,
        29000.00,
        'Electronics equipment proforma'
      )
    `;

    await connection.execute(sampleProformaSQL);
    console.log("✅ Sample proforma data inserted");

    console.log("\n🎉 Proforma invoices table setup completed successfully!");
  } catch (error) {
    console.error("❌ Error creating proforma tables:", error);
    throw error;
  } finally {
    await connection.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
createProformasTable().catch(console.error);
