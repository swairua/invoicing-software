#!/usr/bin/env node

/**
 * Script to create admin user in MySQL database
 */

import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
const DATABASE_CONFIG = {
  host:
    process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT || "11397"),
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
};

async function createAdminUser() {
  console.log("🚀 Creating admin user...");

  const connection = await mysql.createConnection(DATABASE_CONFIG);

  try {
    // First, check if we have any companies
    const [companies] = await connection.execute(
      "SELECT id, name FROM companies LIMIT 5",
    );
    console.log("📊 Found companies:", companies);

    if (companies.length === 0) {
      // Create default company
      const companyId = "00000000-0000-0000-0000-000000000001";
      await connection.execute(
        `
        INSERT INTO companies (id, name, email, phone, currency, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          companyId,
          "Demo Company",
          "admin@demo.com",
          "+254700000000",
          "KES",
          true,
        ],
      );
      console.log("✅ Created default company");
    }

    const company = companies[0];
    const companyId = company.id;

    // Hash the password
    const passwordHash = await bcrypt.hash("password", 10);

    // Create admin user
    const userId = "00000000-0000-0000-0000-000000000001";
    const adminUser = {
      id: userId,
      company_id: companyId,
      first_name: "Admin",
      last_name: "User",
      email: "admin@demo.com",
      password_hash: passwordHash,
      role: "admin",
      is_active: true,
    };

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id, email FROM users WHERE email = ?",
      [adminUser.email],
    );

    if (existingUsers.length > 0) {
      console.log("👤 Admin user already exists:", existingUsers[0].email);
      console.log("✅ You can login with:");
      console.log("   Email: admin@demo.com");
      console.log("   Password: password");
    } else {
      // Insert admin user
      await connection.execute(
        `
        INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          adminUser.id,
          adminUser.company_id,
          adminUser.first_name,
          adminUser.last_name,
          adminUser.email,
          adminUser.password_hash,
          adminUser.role,
          adminUser.is_active,
        ],
      );

      console.log("✅ Admin user created successfully!");
      console.log("🔑 Login credentials:");
      console.log("   Email: admin@demo.com");
      console.log("   Password: password");
    }

    // Also create a sales user for testing
    const salesUser = {
      id: "00000000-0000-0000-0000-000000000002",
      company_id: companyId,
      first_name: "Sales",
      last_name: "User",
      email: "sales@demo.com",
      password_hash: passwordHash,
      role: "sales",
      is_active: true,
    };

    const [existingSales] = await connection.execute(
      "SELECT id, email FROM users WHERE email = ?",
      [salesUser.email],
    );

    if (existingSales.length === 0) {
      await connection.execute(
        `
        INSERT INTO users (id, company_id, first_name, last_name, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          salesUser.id,
          salesUser.company_id,
          salesUser.first_name,
          salesUser.last_name,
          salesUser.email,
          salesUser.password_hash,
          salesUser.role,
          salesUser.is_active,
        ],
      );

      console.log("✅ Sales user created successfully!");
      console.log("🔑 Sales login credentials:");
      console.log("   Email: sales@demo.com");
      console.log("   Password: password");
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log("\n🎉 Admin user setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to create admin user:", error);
    process.exit(1);
  });
