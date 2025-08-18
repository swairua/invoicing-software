#!/usr/bin/env node

import mysql from "mysql2/promise";

// Database configuration
const DATABASE_CONFIG = {
  host:
    process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11397"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
  multipleStatements: true,
};

async function addQuotationsTable() {
  let connection;

  try {
    console.log("🔄 Adding quotations table to MySQL database...");

    // Create connection
    connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log("✅ Connected to MySQL database");

    // Check if quotations table already exists
    const [tables] = await connection.execute(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'quotations'
    `,
      [DATABASE_CONFIG.database],
    );

    if (tables.length > 0) {
      console.log("📋 Quotations table already exists");
      return;
    }

    // Create quotations table
    const quotationsTableSQL = `
      CREATE TABLE quotations (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          company_id CHAR(36) NOT NULL,
          customer_id CHAR(36) NOT NULL,
          quote_number VARCHAR(50) NOT NULL,
          issue_date DATE NOT NULL,
          valid_until DATE NOT NULL,
          currency VARCHAR(3) DEFAULT 'KES',
          exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
          
          -- Amounts
          subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
          tax_amount DECIMAL(15,2) DEFAULT 0.00,
          discount_amount DECIMAL(15,2) DEFAULT 0.00,
          total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
          
          -- Status and metadata
          status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted') DEFAULT 'draft',
          
          -- Additional fields
          notes TEXT,
          terms TEXT,
          footer TEXT,
          internal_notes TEXT,
          
          created_by CHAR(36),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY uk_quotations_company_number (company_id, quote_number)
      );
    `;

    await connection.query(quotationsTableSQL);
    console.log("✅ Quotations table created");

    // Create indexes
    await connection.query(
      "CREATE INDEX idx_quotations_company ON quotations (company_id)",
    );
    await connection.query(
      "CREATE INDEX idx_quotations_customer ON quotations (customer_id)",
    );
    await connection.query(
      "CREATE INDEX idx_quotations_status ON quotations (status)",
    );
    await connection.query(
      "CREATE INDEX idx_quotations_date ON quotations (issue_date)",
    );
    console.log("✅ Quotations indexes created");

    // Create quotation items table
    const quotationItemsTableSQL = `
      CREATE TABLE quotation_items (
          id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
          quotation_id CHAR(36) NOT NULL,
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
          
          FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
          FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
      );
    `;

    await connection.query(quotationItemsTableSQL);
    console.log("✅ Quotation items table created");

    // Create indexes for quotation items
    await connection.query(
      "CREATE INDEX idx_quotation_items_quotation ON quotation_items (quotation_id)",
    );
    await connection.query(
      "CREATE INDEX idx_quotation_items_product ON quotation_items (product_id)",
    );
    console.log("✅ Quotation items indexes created");

    console.log("🎉 Quotations tables added successfully!");
  } catch (error) {
    console.error("❌ Failed to add quotations table:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run the script
addQuotationsTable();
