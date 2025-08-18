#!/usr/bin/env node

const { Client } = require('pg');

// Database connection configuration
const connectionString = 'postgresql://postgres:Sirgeorge.12@db.qvtgnxezqwwlhzdmtwhc.supabase.co:5432/postgres';

async function testConnection() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic query
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Current time:', timeResult.rows[0].current_time);
    
    // Test our tables
    const tablesResult = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log(`📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    
    // Test sample data
    const customersResult = await client.query('SELECT COUNT(*) as count FROM customers');
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    const invoicesResult = await client.query('SELECT COUNT(*) as count FROM invoices');
    
    console.log('\n📈 Data Summary:');
    console.log(`   Customers: ${customersResult.rows[0].count}`);
    console.log(`   Products: ${productsResult.rows[0].count}`);
    console.log(`   Invoices: ${invoicesResult.rows[0].count}`);
    
    // Test a sample query
    const sampleCustomer = await client.query(`
      SELECT name, email, current_balance 
      FROM customers 
      LIMIT 1
    `);
    
    if (sampleCustomer.rows.length > 0) {
      console.log('\n👤 Sample Customer:');
      console.log(`   Name: ${sampleCustomer.rows[0].name}`);
      console.log(`   Email: ${sampleCustomer.rows[0].email}`);
      console.log(`   Balance: KES ${parseFloat(sampleCustomer.rows[0].current_balance).toLocaleString()}`);
    }
    
    console.log('\n🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection();
