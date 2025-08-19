#!/usr/bin/env node

// This script creates sample invoices and payments with the correct statuses
// to make the dashboard show meaningful metrics

const mysql = require("mysql2/promise");
require("dotenv").config();

const DATABASE_CONFIG = {
  host:
    process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT) || 11397,
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: { rejectUnauthorized: false },
};

async function createSampleData() {
  let connection;

  try {
    connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log("✅ Connected to MySQL database\n");

    const companyId = "00000000-0000-0000-0000-000000000001";
    const userId = "b57ee9e5-7cd3-11f0-a984-365070d15890"; // admin user

    // Get some customer IDs for invoices
    const [customers] = await connection.execute(
      "SELECT id FROM customers WHERE company_id = ? LIMIT 3",
      [companyId],
    );

    if (customers.length === 0) {
      console.log(
        "❌ No customers found. Please ensure customers exist first.",
      );
      return;
    }

    console.log(
      `📋 Found ${customers.length} customers to create invoices for`,
    );

    // Create sample invoices with different statuses
    const sampleInvoices = [
      {
        customer_id: customers[0].id,
        invoice_number: "INV-2025-001",
        status: "paid",
        total_amount: 15000.0,
        issue_date: "2025-01-15",
        due_date: "2025-02-14",
      },
      {
        customer_id: customers[1]?.id || customers[0].id,
        invoice_number: "INV-2025-002",
        status: "paid",
        total_amount: 8500.0,
        issue_date: "2025-01-10",
        due_date: "2025-02-09",
      },
      {
        customer_id: customers[2]?.id || customers[0].id,
        invoice_number: "INV-2025-003",
        status: "sent",
        total_amount: 12000.0,
        issue_date: "2025-01-18",
        due_date: "2025-02-17",
      },
      {
        customer_id: customers[0].id,
        invoice_number: "INV-2025-004",
        status: "overdue",
        total_amount: 7500.0,
        issue_date: "2024-12-15",
        due_date: "2025-01-14",
      },
      {
        customer_id: customers[1]?.id || customers[0].id,
        invoice_number: "INV-2025-005",
        status: "sent",
        total_amount: 9800.0,
        issue_date: "2025-01-12",
        due_date: "2025-02-11",
      },
    ];

    console.log("💰 Creating sample invoices...");
    for (const invoice of sampleInvoices) {
      try {
        await connection.execute(
          `
          INSERT INTO invoices (
            id, company_id, customer_id, invoice_number, status,
            issue_date, due_date, subtotal, tax_amount, total_amount,
            currency, created_by, created_at, updated_at
          ) VALUES (
            UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'KES', ?, NOW(), NOW()
          )
        `,
          [
            companyId,
            invoice.customer_id,
            invoice.invoice_number,
            invoice.status,
            invoice.issue_date,
            invoice.due_date,
            invoice.total_amount * 0.86, // subtotal (assuming 16% tax)
            invoice.total_amount * 0.14, // tax amount
            invoice.total_amount,
            userId,
          ],
        );
        console.log(
          `  ✅ Created ${invoice.invoice_number} (${invoice.status}) - KES ${invoice.total_amount}`,
        );
      } catch (error) {
        console.log(
          `  ❌ Failed to create ${invoice.invoice_number}: ${error.message}`,
        );
      }
    }

    // Create sample payments for the paid invoices
    console.log("\n💳 Creating sample payments...");
    const samplePayments = [
      {
        invoice_id: null, // We'll link to invoices if needed
        amount: 15000.0,
        payment_method: "bank_transfer",
        payment_date: "2025-01-20",
      },
      {
        invoice_id: null,
        amount: 8500.0,
        payment_method: "cash",
        payment_date: "2025-01-15",
      },
      {
        invoice_id: null,
        amount: 5000.0,
        payment_method: "mpesa",
        payment_date: "2025-01-22",
      },
    ];

    for (const payment of samplePayments) {
      try {
        await connection.execute(
          `
          INSERT INTO payments (
            id, company_id, customer_id, amount, payment_method,
            payment_date, status, created_by, created_at, updated_at
          ) VALUES (
            UUID(), ?, ?, ?, ?, ?, 'completed', ?, NOW(), NOW()
          )
        `,
          [
            companyId,
            customers[0].id,
            payment.amount,
            payment.payment_method,
            payment.payment_date,
            userId,
          ],
        );
        console.log(
          `  ✅ Created payment of KES ${payment.amount} via ${payment.payment_method}`,
        );
      } catch (error) {
        console.log(`  ❌ Failed to create payment: ${error.message}`);
      }
    }

    // Test the dashboard queries
    console.log("\n📊 Testing dashboard queries:");

    const [totalRevenue] = await connection.execute(
      "SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM invoices WHERE company_id = ? AND status = 'paid'",
      [companyId],
    );
    console.log(
      `Total Revenue (paid invoices): KES ${totalRevenue[0].totalRevenue}`,
    );

    const [outstanding] = await connection.execute(
      "SELECT COALESCE(SUM(total_amount), 0) as outstandingInvoices FROM invoices WHERE company_id = ? AND status IN ('sent', 'overdue')",
      [companyId],
    );
    console.log(
      `Outstanding Invoices (sent/overdue): KES ${outstanding[0].outstandingInvoices}`,
    );

    const [recentPayments] = await connection.execute(
      "SELECT COALESCE(SUM(amount), 0) as recentPayments FROM payments WHERE company_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
      [companyId],
    );
    console.log(
      `Recent Payments (30 days): KES ${recentPayments[0].recentPayments}`,
    );

    console.log("\n🎉 Sample data created successfully!");
    console.log("The dashboard should now show meaningful metrics.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

createSampleData();
