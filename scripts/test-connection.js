#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Tests the specific Neon connection
 */

import pkg from "pg";
const { Pool } = pkg;

async function testNeonConnection() {
  console.log("🧪 Testing Neon Database Connection\n");

  const databaseUrl =
    "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  console.log("🔌 Connection string configured");
  console.log("🏗️ Creating connection pool...");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    connectionTimeoutMillis: 10000,
    application_name: "fusion-invoicing-test",
  });

  try {
    console.log("⏳ Testing connection...");
    const client = await pool.connect();

    // Basic connection test
    const result = await client.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ CONNECTION SUCCESSFUL!");
    console.log("🕐 Server time:", result.rows[0].current_time);
    console.log("🗄️ PostgreSQL version:", result.rows[0].version.split(" ")[0]);

    // Test table existence
    console.log("\n📋 Checking for tables...");
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tables.rows.length > 0) {
      console.log(`✅ Found ${tables.rows.length} tables:`);
      tables.rows.forEach((row) => {
        console.log(`   • ${row.table_name}`);
      });
    } else {
      console.log("⚠️ No tables found - database is empty");
      console.log("🔧 Need to run migration to create schema");
    }

    // Test data
    try {
      const dataTest = await client.query(
        "SELECT COUNT(*) as count FROM companies",
      );
      console.log(
        `\n📊 Data check: ${dataTest.rows[0].count} companies in database`,
      );

      if (dataTest.rows[0].count > 0) {
        const company = await client.query(
          "SELECT name FROM companies LIMIT 1",
        );
        console.log(`   • Primary company: ${company.rows[0].name}`);
      }
    } catch (err) {
      console.log("\n⚠️ No data tables found - need to run migration");
    }

    client.release();
    console.log("\n🎉 Database test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ CONNECTION FAILED:", error.message);
    console.log("\n🔧 Possible issues:");
    console.log("   • Database credentials incorrect");
    console.log("   • Network/firewall blocking connection");
    console.log("   • Neon instance not accessible");
    return false;
  } finally {
    await pool.end();
  }
}

// Run test
testNeonConnection()
  .then((success) => {
    console.log(`\n${success ? "✅ TEST PASSED" : "❌ TEST FAILED"}`);
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
  });
