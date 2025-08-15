import { Router } from "express";
import Database from "../database";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

// Force database migration
router.post("/run-migration", async (req, res) => {
  try {
    console.log("🚀 Starting manual database migration...");

    const db = Database.getInstance();

    // Test connection first
    const connectionTest = await db.testConnection();
    if (!connectionTest) {
      return res.status(500).json({
        success: false,
        error: "Database connection failed",
      });
    }

    // Check if tables exist
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('companies', 'customers', 'products', 'invoices')
    `);

    if (tableCheck.rows.length === 0) {
      console.log("📋 No schema found, running migration...");

      // Read migration file
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const migrationPath = path.join(
        __dirname,
        "..",
        "..",
        "database",
        "render-migration.sql",
      );

      if (!fs.existsSync(migrationPath)) {
        return res.status(500).json({
          success: false,
          error: "Migration file not found",
        });
      }

      const migrationSQL = fs.readFileSync(migrationPath, "utf8");

      console.log("⚙️ Executing database migration...");
      await db.query(migrationSQL);
      console.log("✅ Database migration completed successfully!");

      // Verify tables were created
      const verifyTables = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      const tableNames = verifyTables.rows.map((row) => row.table_name);

      res.json({
        success: true,
        message: "Database migration completed successfully",
        data: {
          tablesCreated: tableNames.length,
          tables: tableNames,
        },
      });
    } else {
      console.log("✅ Database schema already exists");
      const tableNames = tableCheck.rows.map((row) => row.table_name);

      res.json({
        success: true,
        message: "Database schema already exists",
        data: {
          existingTables: tableNames.length,
          tables: tableNames,
        },
      });
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      error: "Migration failed",
      details: error.message,
    });
  }
});

// Check database status
router.get("/status", async (req, res) => {
  try {
    const db = Database.getInstance();

    // Test connection
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      return res.json({
        success: true,
        data: {
          connected: false,
          message: "Database connection failed",
        },
      });
    }

    // Check tables
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    // Check sample data
    const customerCount = await db.query(
      "SELECT COUNT(*) as count FROM customers",
    );
    const productCount = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );

    res.json({
      success: true,
      data: {
        connected: true,
        tables: tableCheck.rows.length,
        tableNames: tableCheck.rows.map((row) => row.table_name),
        customers: parseInt(customerCount.rows[0].count),
        products: parseInt(productCount.rows[0].count),
      },
    });
  } catch (error) {
    console.error("❌ Status check failed:", error);
    res.status(500).json({
      success: false,
      error: "Status check failed",
      details: error.message,
    });
  }
});

export default router;
