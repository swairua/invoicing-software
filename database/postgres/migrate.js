#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const connectionString = 'postgresql://postgres:Sirgeorge.12@db.qvtgnxezqwwlhzdmtwhc.supabase.co:5432/postgres';

// Parse connection string
const dbConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
};

const client = new Client(dbConfig);

// Migration files in order
const migrations = [
  '001_initial_schema.sql',
  '002_seed_data.sql'
];

async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await client.query(createTableQuery);
  console.log('✅ Migrations table ready');
}

async function checkIfMigrationExecuted(filename) {
  const result = await client.query(
    'SELECT COUNT(*) FROM migrations WHERE filename = $1',
    [filename]
  );
  return parseInt(result.rows[0].count) > 0;
}

async function recordMigration(filename) {
  await client.query(
    'INSERT INTO migrations (filename) VALUES ($1)',
    [filename]
  );
}

async function executeMigration(filename) {
  const filePath = path.join(__dirname, 'migrations', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filePath}`);
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📦 Executing migration: ${filename}`);
  
  try {
    // Split SQL file by statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
      }
    }
    
    await recordMigration(filename);
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error('Error:', error.message);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');
    console.log(`📍 Connecting to: ${connectionString.replace(/:[^:@]*@/, ':***@')}`);
    
    await client.connect();
    console.log('✅ Database connected successfully');
    
    await createMigrationsTable();
    
    for (const migrationFile of migrations) {
      const isExecuted = await checkIfMigrationExecuted(migrationFile);
      
      if (isExecuted) {
        console.log(`⏭️  Skipping already executed migration: ${migrationFile}`);
      } else {
        await executeMigration(migrationFile);
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
    // Show some stats
    const tablesResult = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Tables created: ${tablesResult.rows.length}`);
    
    // Show some sample data counts
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM companies'),
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM customers'),
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM invoices'),
      client.query('SELECT COUNT(*) FROM quotations'),
      client.query('SELECT COUNT(*) FROM payments')
    ]);
    
    console.log(`   Companies: ${counts[0].rows[0].count}`);
    console.log(`   Users: ${counts[1].rows[0].count}`);
    console.log(`   Customers: ${counts[2].rows[0].count}`);
    console.log(`   Products: ${counts[3].rows[0].count}`);
    console.log(`   Invoices: ${counts[4].rows[0].count}`);
    console.log(`   Quotations: ${counts[5].rows[0].count}`);
    console.log(`   Payments: ${counts[6].rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📦 PostgreSQL Migration Script

Usage:
  node migrate.js              # Run all pending migrations
  node migrate.js --help       # Show this help message

Environment:
  DATABASE_URL: ${connectionString.replace(/:[^:@]*@/, ':***@')}

Migrations:
  ${migrations.map(m => `- ${m}`).join('\n  ')}
  `);
  process.exit(0);
}

// Run migrations
runMigrations();
