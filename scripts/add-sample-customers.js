#!/usr/bin/env node

/**
 * Script to add sample customers to the database
 */

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function addSampleCustomers() {
  console.log("🚀 Adding sample customers...\n");

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    connectionTimeoutMillis: 20000,
    application_name: "fusion-invoicing-sample",
  });

  try {
    const client = await pool.connect();

    // Sample customers
    const customers = [
      {
        id: 'c1234567-1234-1234-1234-123456789001',
        name: 'Acme Corporation Ltd',
        email: 'contact@acme.co.ke',
        phone: '+254712345678',
        kra_pin: 'P051234567A',
        address: 'Westlands Avenue, Nairobi, Kenya',
        credit_limit: 500000,
        current_balance: 0,
        is_active: true,
        company_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        id: 'c1234567-1234-1234-1234-123456789002',
        name: 'Safari Digital Agency',
        email: 'info@safaridigital.co.ke',
        phone: '+254723456789',
        kra_pin: 'P051234567B',
        address: 'Karen Road, Karen, Nairobi',
        credit_limit: 250000,
        current_balance: 0,
        is_active: true,
        company_id: '00000000-0000-0000-0000-000000000001'
      },
      {
        id: 'c1234567-1234-1234-1234-123456789003',
        name: 'East Africa Logistics',
        email: 'orders@ealogistics.com',
        phone: '+254734567890',
        kra_pin: 'P051234567C',
        address: 'Industrial Area, Mombasa Road, Nairobi',
        credit_limit: 750000,
        balance: 0,
        is_active: true,
        company_id: '00000000-0000-0000-0000-000000000001'
      }
    ];

    console.log('🏢 Creating sample customers...');
    
    for (const customer of customers) {
      try {
        await client.query(`
          INSERT INTO customers (id, company_id, name, email, phone, address, kra_pin, credit_limit, balance, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO NOTHING
        `, [
          customer.id,
          customer.company_id,
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.kra_pin,
          customer.credit_limit,
          customer.balance,
          customer.is_active
        ]);
        
        console.log(`✅ Created customer: ${customer.name}`);
      } catch (error) {
        console.error(`❌ Failed to create customer ${customer.name}:`, error.message);
      }
    }

    // Check customer count
    const customerCount = await client.query('SELECT COUNT(*) as count FROM customers');
    console.log(`\n📊 Total customers: ${customerCount.rows[0].count}`);

    client.release();
    console.log("\n🎉 Sample customers added successfully!");
    
  } catch (error) {
    console.error("❌ Failed to add sample customers:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addSampleCustomers().catch(console.error);
}

export { addSampleCustomers };
