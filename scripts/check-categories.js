#!/usr/bin/env node

import mysql from "mysql2/promise";

async function checkCategories() {
  console.log("🔍 Checking available categories in database...\n");

  const connection = await mysql.createConnection({
    host:
      process.env.DB_HOST ||
      "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
    port: parseInt(process.env.DB_PORT || "11397"),
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
    database: process.env.DB_NAME || "defaultdb",
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Get all categories
    const [categories] = await connection.execute(`
      SELECT id, name, description, company_id, is_active, created_at
      FROM product_categories 
      ORDER BY name
    `);

    console.log("📁 Available Categories:");
    console.log("=".repeat(80));

    if (categories.length === 0) {
      console.log("❌ No categories found in database");
      console.log("🔧 Adding sample categories...\n");

      const companyId = "00000000-0000-0000-0000-000000000001";

      const sampleCategories = [
        {
          name: "Medical Supplies",
          description: "Basic medical supplies and consumables",
        },
        {
          name: "Medical Equipment",
          description: "Medical devices and equipment",
        },
        {
          name: "Electronics",
          description: "Electronic devices and accessories",
        },
        { name: "General", description: "General products and items" },
      ];

      for (const category of sampleCategories) {
        await connection.execute(
          `
          INSERT INTO product_categories (id, name, description, company_id, is_active, created_at, updated_at)
          VALUES (UUID(), ?, ?, ?, TRUE, NOW(), NOW())
        `,
          [category.name, category.description, companyId],
        );
        console.log(`✅ Created category: ${category.name}`);
      }

      // Fetch categories again
      const [newCategories] = await connection.execute(`
        SELECT id, name, description, company_id, is_active, created_at
        FROM product_categories 
        ORDER BY name
      `);

      console.log("\n📁 Categories after creation:");
      console.log("=".repeat(80));
      newCategories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   ID: ${cat.id}`);
        console.log(`   Description: ${cat.description}`);
        console.log(`   Company: ${cat.company_id}`);
        console.log("");
      });
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   ID: ${cat.id}`);
        console.log(`   Description: ${cat.description || "No description"}`);
        console.log(`   Company: ${cat.company_id}`);
        console.log(`   Active: ${cat.is_active ? "Yes" : "No"}`);
        console.log("");
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkCategories().catch(console.error);
