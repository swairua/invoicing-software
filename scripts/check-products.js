#!/usr/bin/env node

import mysql from "mysql2/promise";

async function checkProducts() {
  console.log("🔍 Checking available products in database...\n");

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
    // Get all products
    const [products] = await connection.execute(`
      SELECT 
        p.id, 
        p.name, 
        p.sku, 
        p.company_id,
        pc.name as category_name
      FROM products p 
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    console.log("📦 Available Products:");
    console.log("=".repeat(80));

    if (products.length === 0) {
      console.log("❌ No products found in database");
    } else {
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Category: ${product.category_name || "None"}`);
        console.log(`   Company: ${product.company_id}`);
        console.log("");
      });
    }

    // Check categories too
    const [categories] = await connection.execute(`
      SELECT id, name, company_id
      FROM product_categories 
      ORDER BY name
    `);

    console.log("📁 Available Categories:");
    console.log("=".repeat(80));

    if (categories.length === 0) {
      console.log("❌ No categories found in database");
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (ID: ${cat.id})`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await connection.end();
  }
}

checkProducts().catch(console.error);
