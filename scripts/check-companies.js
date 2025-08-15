#!/usr/bin/env node

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkCompanies() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 20000,
  });

  try {
    const client = await pool.connect();

    // Check existing companies
    const companies = await client.query('SELECT id, name FROM companies ORDER BY created_at');
    
    console.log("🏢 Existing companies:");
    companies.rows.forEach((company) => {
      console.log(`   • ${company.id} - ${company.name}`);
    });

    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkCompanies().catch(console.error);
