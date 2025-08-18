#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const DATABASE_CONFIG = {
  host: process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11397"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
  multipleStatements: true,
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Starting MySQL database migration...');
    console.log(`📍 Connecting to: ${DATABASE_CONFIG.host}:${DATABASE_CONFIG.port}`);
    
    // Create connection
    connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log('✅ Connected to MySQL database');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/mysql/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');
    
    // Execute migration
    console.log('🚀 Executing migration...');
    await connection.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
      ORDER BY table_name
    `, [DATABASE_CONFIG.database]);
    
    console.log(`📋 Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check if default data was inserted
    const [companies] = await connection.execute('SELECT COUNT(*) as count FROM companies');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`👥 Default data inserted:`);
    console.log(`   - Companies: ${companies[0].count}`);
    console.log(`   - Users: ${users[0].count}`);
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.sql) {
      console.error('💻 SQL Error:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
