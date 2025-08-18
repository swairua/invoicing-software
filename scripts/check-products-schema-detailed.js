#!/usr/bin/env node

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkProductsSchemaDetailed() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 20000,
  });

  try {
    const client = await pool.connect();

    // Check products table structure with detailed info
    const productColumns = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    console.log("📋 Products table columns (detailed):");
    productColumns.rows.forEach((col) => {
      const length = col.character_maximum_length
        ? `(${col.character_maximum_length})`
        : "";
      const precision =
        col.numeric_precision && col.numeric_scale
          ? `(${col.numeric_precision},${col.numeric_scale})`
          : "";
      const typeInfo = `${col.data_type}${length}${precision}`;

      console.log(
        `   • ${col.column_name}: ${typeInfo} ${col.is_nullable === "NO" ? "NOT NULL" : "NULL"} ${col.column_default ? `DEFAULT ${col.column_default}` : ""}`,
      );
    });

    // Check indexes and constraints
    const indexes = await client.query(`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'products' AND schemaname = 'public'
      ORDER BY indexname;
    `);

    console.log("\n🔧 Products table indexes:");
    indexes.rows.forEach((idx) => {
      console.log(`   • ${idx.indexname}: ${idx.indexdef}`);
    });

    // Check a sample product to see actual data types
    const sampleProduct = await client.query(`
      SELECT * FROM products LIMIT 1;
    `);

    if (sampleProduct.rows.length > 0) {
      console.log("\n📄 Sample product data:");
      console.log(
        "   ID:",
        typeof sampleProduct.rows[0].id,
        "->",
        sampleProduct.rows[0].id,
      );
      console.log(
        "   Name:",
        typeof sampleProduct.rows[0].name,
        "->",
        sampleProduct.rows[0].name,
      );
      console.log(
        "   Company ID:",
        typeof sampleProduct.rows[0].company_id,
        "->",
        sampleProduct.rows[0].company_id,
      );
    }

    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkProductsSchemaDetailed().catch(console.error);
