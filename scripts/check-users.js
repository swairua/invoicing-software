#!/usr/bin/env node

/**
 * Script to check existing users and create missing admin user
 */

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
const DATABASE_CONFIG = {
  host: process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11397"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
};

async function checkAndCreateUsers() {
  console.log("🔍 Checking existing users...");
  
  const connection = await mysql.createConnection(DATABASE_CONFIG);
  
  try {
    // Check existing users
    const [users] = await connection.execute('SELECT id, email, role FROM users ORDER BY email');
    console.log("👥 Existing users:");
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Get first company for new users
    const [companies] = await connection.execute('SELECT id, name FROM companies LIMIT 1');
    if (companies.length === 0) {
      console.log("❌ No companies found. Please create a company first.");
      return;
    }
    
    const companyId = companies[0].id;
    console.log(`🏢 Using company: ${companies[0].name} (${companyId})`);
    
    // Hash the password
    const passwordHash = await bcrypt.hash("password", 10);
    
    // Check if admin@crestview.co.ke exists, if not create it
    const [crestviewUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@crestview.co.ke']
    );
    
    if (crestviewUser.length === 0) {
      await connection.execute(`
        INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        "crestview-admin-0000-0000-000000000001",
        companyId,
        "Crestview",
        "Admin",
        "admin@crestview.co.ke",
        passwordHash,
        "admin",
        true
      ]);
      
      console.log("✅ Created admin@crestview.co.ke user");
    } else {
      console.log("👤 admin@crestview.co.ke already exists");
    }
    
    // Check final user list
    const [finalUsers] = await connection.execute('SELECT email, role FROM users ORDER BY email');
    console.log("\n📋 Final user list:");
    finalUsers.forEach(user => {
      console.log(`  ✅ ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
checkAndCreateUsers()
  .then(() => {
    console.log("\n🎉 User check complete!");
    console.log("\n🔑 Available login credentials:");
    console.log("   admin@demo.com / password");
    console.log("   admin@crestview.co.ke / password");
    console.log("   sales@demo.com / password");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed:", error);
    process.exit(1);
  });
