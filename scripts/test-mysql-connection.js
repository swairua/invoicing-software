#!/usr/bin/env node

import Database from "../server/database.js";

async function testConnection() {
  try {
    console.log("🧪 Testing MySQL database connection...");

    const connected = await Database.testConnection();

    if (connected) {
      console.log("✅ MySQL connection test successful!");

      // Test a simple query
      const result = await Database.query(
        "SELECT COUNT(*) as company_count FROM companies",
      );
      console.log(`📊 Companies in database: ${result.rows[0].company_count}`);

      // Test product query
      const products = await Database.query(
        "SELECT COUNT(*) as product_count FROM products",
      );
      console.log(`📦 Products in database: ${products.rows[0].product_count}`);
    } else {
      console.log("❌ MySQL connection test failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error.message);
    process.exit(1);
  } finally {
    await Database.close();
  }
}

testConnection();
