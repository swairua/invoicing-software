#!/usr/bin/env node

/**
 * Database Status Check Script
 * Verifies database connection and schema
 */

import pkg from "pg";
const { Pool } = pkg;

async function checkDatabase() {
  console.log("🔍 Checking database status...\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("❌ No DATABASE_URL environment variable found");
    console.log("🔧 Database configuration needed for live data");
    return false;
  }

  console.log("✅ DATABASE_URL found");
  console.log("🔌 Testing connection...");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("neon.tech") ||
      databaseUrl.includes("supabase.co") ||
      databaseUrl.includes("render.com")
        ? {
            rejectUnauthorized: false,
          }
        : false,
    max: 10,
    connectionTimeoutMillis: 20000,
    application_name: "fusion-invoicing-check",
  });

  try {
    const client = await pool.connect();

    // Test basic connection
    const result = await client.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ Database connection successful!");
    console.log("🕐 Server time:", result.rows[0].current_time);
    console.log("🗄️ PostgreSQL version:", result.rows[0].version.split(" ")[0]);

    // Check for required tables
    console.log("\n📋 Checking database schema...");
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const requiredTables = [
      "companies",
      "users",
      "customers",
      "suppliers",
      "products",
      "invoices",
      "invoice_items",
      "quotations",
      "quotation_items",
      "proforma_invoices",
      "proforma_items",
      "payments",
      "credit_notes",
      "purchase_orders",
      "delivery_notes",
      "packing_lists",
    ];

    const existingTables = tableCheck.rows.map((row) => row.table_name);
    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table),
    );

    if (missingTables.length === 0) {
      console.log("✅ All required tables exist");
      console.log("📊 Found tables:", existingTables.length);
    } else {
      console.log("⚠️ Missing tables:", missingTables.join(", "));
      console.log("🔧 Run migration to create missing tables");
    }

    // Check for sample data
    console.log("\n📊 Checking sample data...");
    const companyCount = await client.query(
      "SELECT COUNT(*) as count FROM companies",
    );
    const customerCount = await client.query(
      "SELECT COUNT(*) as count FROM customers",
    );
    const productCount = await client.query(
      "SELECT COUNT(*) as count FROM products",
    );

    console.log(`   • Companies: ${companyCount.rows[0].count}`);
    console.log(`   • Customers: ${customerCount.rows[0].count}`);
    console.log(`   • Products: ${productCount.rows[0].count}`);

    if (companyCount.rows[0].count > 0) {
      const company = await client.query("SELECT name FROM companies LIMIT 1");
      console.log(`   • Primary company: ${company.rows[0].name}`);
    }

    client.release();
    console.log("\n🎉 Database check completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database check failed:", error.message);
    console.log("\n🔧 Possible solutions:");
    console.log("   • Verify DATABASE_URL is correct");
    console.log("   • Check if database server is running");
    console.log("   • Run migration script if schema is missing");
    return false;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Script error:", error);
      process.exit(1);
    });
}

export { checkDatabase };
