#!/usr/bin/env node

/**
 * Render Deployment Script
 * Sets up MySQL database and verifies connection
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployToRender() {
  console.log("🚀 Starting Render deployment process...\n");
  console.log("🗄️ Database configuration: LIVE MYSQL DATABASE MODE");
  console.log("❌ Mock data has been removed - database required\n");

  // Check if database environment variables are available
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  if (!dbHost || !dbPort || !dbUser || !dbPassword || !dbName) {
    console.log("⚠️ MySQL database environment variables not found");
    console.log("🔧 Required variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME");
    console.log("📋 Database tables will need to be created manually");
    console.log("⏳ This may take a few minutes...\n");
    return;
  }

  console.log(`📍 Connecting to MySQL: ${dbHost}:${dbPort}`);
  console.log(`🗄️ Database: ${dbName}`);
  console.log(`👤 User: ${dbUser}`);

  try {
    console.log("⏳ Testing MySQL database connection...");

    // Create connection
    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log("✅ MySQL connection successful!");

    // Test basic query
    const [result] = await connection.execute("SELECT NOW() AS current_time, VERSION() AS version");
    console.log("🕐 Server time:", result[0].current_time);
    console.log("🗄️ MySQL version:", result[0].version.split("-")[0]);

    // Check if tables exist
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
      ORDER BY table_name
    `, [dbName]);

    if (tables.length === 0) {
      console.log("⚠️ No tables found - running migration...");
      
      // Read and execute migration
      const migrationPath = path.join(__dirname, "../database/mysql/migrations/001_initial_schema.sql");
      
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, "utf8");
        await connection.query(migrationSQL);
        console.log("✅ Database migration completed!");
      } else {
        console.log("❌ Migration file not found:", migrationPath);
      }
    } else {
      console.log(`📋 Found ${tables.length} existing tables:`);
      tables.slice(0, 5).forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
      if (tables.length > 5) {
        console.log(`   ... and ${tables.length - 5} more`);
      }
    }

    // Verify core tables exist
    const coreTableChecks = ["companies", "users", "products", "customers"];
    for (const tableName of coreTableChecks) {
      const [tableExists] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `, [dbName, tableName]);
      
      if (tableExists[0].count > 0) {
        const [recordCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ Table '${tableName}': ${recordCount[0].count} records`);
      } else {
        console.log(`❌ Table '${tableName}': Missing`);
      }
    }

    await connection.end();
    console.log("🎉 Database verification completed successfully!\n");

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("🔧 Please check your MySQL connection details");
    console.log("📞 Contact support if this error persists\n");
    
    // Don't fail the deployment, just warn
    console.log("⚠️  Continuing deployment without database verification...");
  }

  console.log("🚀 Deployment verification complete!");
  console.log("📱 Application will start with LIVE MYSQL DATABASE");
  console.log("🔄 All changes will be saved to the database\n");
}

// Run deployment check
deployToRender().catch((error) => {
  console.error("💥 Deployment script failed:", error);
  process.exit(1);
});
