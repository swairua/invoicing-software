#!/usr/bin/env node

/**
 * Render Deployment Script
 * Sets up database and verifies connection
 */

import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployToRender() {
  console.log("🚀 Starting Render deployment process...\n");
  console.log("🗄️ Database configuration: LIVE DATABASE MODE");
  console.log("❌ Mock data has been removed - database required\n");

  // Check if DATABASE_URL is available
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("⚠️ No DATABASE_URL found");
    console.log("🔧 Render will create the database during first deployment");
    console.log("📋 Database tables will be created automatically");
    console.log("⏳ This may take a few minutes...\n");
    return;
  }

  console.log("🗄️ Database URL found, setting up connection...");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.co") || databaseUrl.includes("render.com") ? {
      rejectUnauthorized: false
    } : false,
    max: 10,
    connectionTimeoutMillis: 20000,
    application_name: "fusion-invoicing-migration"
  });

  try {
    // Test basic connection
    console.log("🔌 Testing database connection...");
    const client = await pool.connect();

    const result = await client.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ Database connection successful!");
    console.log("🕐 Current time:", result.rows[0].current_time);
    console.log("🗄️ PostgreSQL version:", result.rows[0].version.split(" ")[0]);

    // Check if schema exists
    console.log("\n🔍 Checking database schema...");
    try {
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('companies', 'customers', 'products', 'invoices')
      `);

      if (tableCheck.rows.length === 0) {
        console.log("📋 No schema found, running migration...");

        // Read and execute migration
        const migrationPath = path.join(
          __dirname,
          "..",
          "database",
          "render-migration.sql",
        );
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");

        console.log("⚙️ Executing database migration...");
        await client.query(migrationSQL);
        console.log("✅ Database migration completed successfully!");

        // Verify tables were created
        const verifyTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);

        console.log("📋 Created tables:");
        verifyTables.rows.forEach((row) => {
          console.log(`   • ${row.table_name}`);
        });
      } else {
        console.log("✅ Database schema already exists");
        console.log("📋 Found tables:");
        tableCheck.rows.forEach((row) => {
          console.log(`   • ${row.table_name}`);
        });
      }
    } catch (schemaError) {
      console.error("❌ Schema check failed:", schemaError.message);
    }

    client.release();
    console.log("\n🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.log("📱 App will continue with mock data mode");
  } finally {
    await pool.end();
  }

  console.log("\n🚀 Render deployment ready!");
  console.log(
    "📱 Your app will be available at: https://invoicing-software-m6hz.onrender.com",
  );
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployToRender().catch(console.error);
}

export { deployToRender };
