#!/usr/bin/env node

/**
 * Script to fix database schema by creating missing tables
 */

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function fixDatabase() {
  console.log("🚀 Starting database fix...\n");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    connectionTimeoutMillis: 20000,
    application_name: "fusion-invoicing-fix",
  });

  try {
    console.log("🔌 Testing database connection...");
    const client = await pool.connect();

    const result = await client.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ Database connection successful!");
    console.log("🕐 Current time:", result.rows[0].current_time);

    // Check existing tables
    console.log("\n🔍 Checking existing tables...");
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("📋 Existing tables:", tableCheck.rows.length);
    tableCheck.rows.forEach((row) => {
      console.log(`   • ${row.table_name}`);
    });

    // Check if number_sequences table exists
    const numberSeqCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'number_sequences'
    `);

    if (numberSeqCheck.rows.length === 0) {
      console.log("\n⚠️ number_sequences table missing, creating...");

      // Create number_sequences table
      await client.query(`
        CREATE TABLE IF NOT EXISTS number_sequences (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID NOT NULL,
          sequence_type VARCHAR(50) NOT NULL,
          prefix VARCHAR(10),
          current_number INTEGER DEFAULT 1,
          UNIQUE(company_id, sequence_type)
        );
      `);

      // Insert default number sequences
      await client.query(`
        INSERT INTO number_sequences (company_id, sequence_type, prefix, current_number)
        VALUES
          ('00000000-0000-0000-0000-000000000001', 'invoice', 'INV', 1001),
          ('00000000-0000-0000-0000-000000000001', 'quotation', 'QUO', 1001),
          ('00000000-0000-0000-0000-000000000001', 'proforma', 'PRO', 1001),
          ('00000000-0000-0000-0000-000000000001', 'credit_note', 'CN', 1001),
          ('00000000-0000-0000-0000-000000000001', 'customer', 'CUST', 1001),
          ('00000000-0000-0000-0000-000000000001', 'supplier', 'SUPP', 1001)
        ON CONFLICT (company_id, sequence_type) DO NOTHING;
      `);

      console.log("✅ number_sequences table created successfully!");
    } else {
      console.log("✅ number_sequences table already exists");
    }

    // Verify the fix by checking customer count
    const customerCount = await client.query(
      "SELECT COUNT(*) as count FROM customers",
    );
    console.log(`\n📊 Current customers: ${customerCount.rows[0].count}`);

    client.release();
    console.log("\n🎉 Database fix completed successfully!");
  } catch (error) {
    console.error("❌ Database fix failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabase().catch(console.error);
}

export { fixDatabase };
