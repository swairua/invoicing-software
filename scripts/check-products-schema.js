#!/usr/bin/env node

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkProductsSchema() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 20000,
  });

  try {
    const client = await pool.connect();

    // Check products table structure
    const productColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log("📋 Products table columns:");
    productColumns.rows.forEach((col) => {
      console.log(
        `   • ${col.column_name} (${col.data_type}) ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"} ${col.column_default ? `DEFAULT ${col.column_default}` : ""}`,
      );
    });

    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkProductsSchema().catch(console.error);
