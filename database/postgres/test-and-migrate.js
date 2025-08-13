#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const connectionString = 'postgresql://postgres:Sirgeorge.12@db.qvtgnxezqwwlhzdmtwhc.supabase.co:5432/postgres';

const dbConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
};

async function testConnection() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔗 Testing database connection...');
    await client.connect();
    
    const result = await client.query('SELECT NOW() as current_time, VERSION() as version');
    console.log('✅ Database connected successfully!');
    console.log(`⏰ Current time: ${result.rows[0].current_time}`);
    console.log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    // Check if migrations table exists
    const migrationsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (migrationsCheck.rows[0].exists) {
      const migrationsList = await client.query('SELECT filename, executed_at FROM migrations ORDER BY executed_at');
      console.log('\n📦 Executed migrations:');
      migrationsList.rows.forEach(row => {
        console.log(`   ✓ ${row.filename} (${new Date(row.executed_at).toISOString()})`);
      });
    } else {
      console.log('\n⚠️  Migrations table does not exist yet');
    }
    
    // Check if tax configurations table exists
    const taxConfigCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tax_configurations'
      );
    `);
    
    if (taxConfigCheck.rows[0].exists) {
      const taxCount = await client.query('SELECT COUNT(*) FROM tax_configurations');
      console.log(`\n💰 Tax configurations table exists with ${taxCount.rows[0].count} records`);
    } else {
      console.log('\n💰 Tax configurations table does not exist - migration needed');
    }
    
    // Show basic table counts
    const tableStats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies) as companies,
        (SELECT COUNT(*) FROM customers) as customers,
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM invoices) as invoices;
    `);
    
    const stats = tableStats.rows[0];
    console.log('\n📊 Current data:');
    console.log(`   Companies: ${stats.companies}`);
    console.log(`   Customers: ${stats.customers}`);
    console.log(`   Products: ${stats.products}`);
    console.log(`   Invoices: ${stats.invoices}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
  
  return true;
}

async function runMigration(filename) {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if migration was already executed
    const check = await client.query(
      'SELECT COUNT(*) FROM migrations WHERE filename = $1',
      [filename]
    );
    
    if (parseInt(check.rows[0].count) > 0) {
      console.log(`⏭️  Migration ${filename} already executed`);
      return true;
    }
    
    // Read and execute migration
    const filePath = path.join(__dirname, 'migrations', filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${filePath}`);
      return false;
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📦 Executing migration: ${filename}`);
    
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`✅ Migration completed: ${filename}`);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Migration failed: ${filename}`);
      console.error('Error:', error.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🚀 Database Test and Migration Tool');
  console.log('=====================================\n');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('\n🔧 Running migrations...');
  
  const migrations = [
    '001_initial_schema.sql',
    '002_seed_data.sql',
    '003_tax_configuration.sql'
  ];
  
  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (!success) {
      console.error(`❌ Failed to run migration: ${migration}`);
      process.exit(1);
    }
  }
  
  console.log('\n🎉 All migrations completed successfully!');
  
  // Final connection test to show updated status
  console.log('\n📊 Final status check...');
  await testConnection();
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Database Test and Migration Tool

Usage:
  node test-and-migrate.js        # Test connection and run migrations
  node test-and-migrate.js --help # Show this help

This tool will:
1. Test the database connection
2. Show current migration status
3. Run any pending migrations
4. Display final database statistics
  `);
  process.exit(0);
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
