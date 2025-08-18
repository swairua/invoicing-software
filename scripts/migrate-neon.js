#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use Neon database connection string from environment or default
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:ZbVBvHWOJOCW@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting Neon database migration...');
    console.log(`📍 Connecting to Neon database...`);
    
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'render-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📦 Executing migration...');
    
    // Split into individual statements and execute
    const statements = migrationSQL
      .split(/;\s*(?=\n|$)/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.match(/^--/));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement + ';');
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          // Some statements might fail if tables already exist, that's OK
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - table already exists (skipped)`);
          } else {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} failed: ${error.message}`);
          }
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Show some stats
    const tablesResult = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Tables in database: ${tablesResult.rows.length}`);
    
    if (tablesResult.rows.length > 0) {
      console.log(`   Tables: ${tablesResult.rows.map(r => r.tablename).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migration
runMigration();
