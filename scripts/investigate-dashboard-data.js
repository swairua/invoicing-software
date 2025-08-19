#!/usr/bin/env node

const mysql = require("mysql2/promise");
require("dotenv").config();

const DATABASE_CONFIG = {
  host: process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT) || 11397,
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: { rejectUnauthorized: false },
};

async function investigateData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log("✅ Connected to MySQL database\n");

    const companyId = "00000000-0000-0000-0000-000000000001";

    // Check if tables exist
    console.log("🗄️ CHECKING TABLE EXISTENCE:");
    const [tables] = await connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    const tableNames = tables.map(t => t.table_name || t.TABLE_NAME);
    console.log("Available tables:", tableNames);
    console.log("Invoices table exists:", tableNames.includes('invoices'));
    console.log("Payments table exists:", tableNames.includes('payments'));

    if (tableNames.includes('invoices')) {
      // Check all invoices and their statuses
      console.log("\n📋 INVOICES DATA:");
      const [invoices] = await connection.execute(
        "SELECT id, invoice_number, status, total_amount, created_at FROM invoices WHERE company_id = ? ORDER BY created_at DESC LIMIT 10",
        [companyId]
      );
      console.log(`Found ${invoices.length} invoices:`);
      if (invoices.length > 0) {
        invoices.forEach(inv => {
          console.log(`  • ${inv.invoice_number || inv.id}: status='${inv.status}', amount=${inv.total_amount}, date=${inv.created_at}`);
        });

        // Check invoice status counts
        console.log("\n��� INVOICE STATUS BREAKDOWN:");
        const [statusCounts] = await connection.execute(
          "SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM invoices WHERE company_id = ? GROUP BY status",
          [companyId]
        );
        statusCounts.forEach(stat => {
          console.log(`  • ${stat.status}: ${stat.count} invoices, total: ${stat.total}`);
        });
      } else {
        console.log("  No invoices found for this company");
      }
    }

    if (tableNames.includes('payments')) {
      // Check all payments
      console.log("\n💰 PAYMENTS DATA:");
      const [payments] = await connection.execute(
        "SELECT id, amount, payment_method, created_at FROM payments WHERE company_id = ? ORDER BY created_at DESC LIMIT 10",
        [companyId]
      );
      console.log(`Found ${payments.length} payments:`);
      if (payments.length > 0) {
        payments.forEach(pay => {
          console.log(`  • Amount: ${pay.amount}, method: ${pay.payment_method || 'N/A'}, date: ${pay.created_at}`);
        });
      } else {
        console.log("  No payments found for this company");
      }
    }

    // Test the exact queries from dashboard
    console.log("\n🔍 TESTING DASHBOARD QUERIES:");
    
    if (tableNames.includes('invoices')) {
      try {
        const [totalRevenue] = await connection.execute(
          "SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM invoices WHERE company_id = ? AND status = 'paid'",
          [companyId]
        );
        console.log(`Total Revenue (paid invoices): ${totalRevenue[0].totalRevenue}`);

        const [outstanding] = await connection.execute(
          "SELECT COALESCE(SUM(total_amount), 0) as outstandingInvoices FROM invoices WHERE company_id = ? AND status IN ('sent', 'overdue')",
          [companyId]
        );
        console.log(`Outstanding Invoices (sent/overdue): ${outstanding[0].outstandingInvoices}`);
      } catch (error) {
        console.log("Error with invoice queries:", error.message);
      }
    }

    if (tableNames.includes('payments')) {
      try {
        const [recentPayments] = await connection.execute(
          "SELECT COALESCE(SUM(amount), 0) as recentPayments FROM payments WHERE company_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
          [companyId]
        );
        console.log(`Recent Payments (30 days): ${recentPayments[0].recentPayments}`);
      } catch (error) {
        console.log("Error with payments query:", error.message);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

investigateData();
