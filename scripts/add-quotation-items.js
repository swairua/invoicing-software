#!/usr/bin/env node

const mysql = require("mysql2/promise");
require("dotenv").config();

const DATABASE_CONFIG = {
  host:
    process.env.DB_HOST || "mysql-242eb3d7-invoicing-software.c.aivencloud.com",
  port: parseInt(process.env.DB_PORT) || 11397,
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "AVNS_x9WdjKNy72pMT6Zr90I",
  database: process.env.DB_NAME || "defaultdb",
  ssl: {
    rejectUnauthorized: false,
  },
};

async function addQuotationItems() {
  let connection;

  try {
    console.log("🔌 Connecting to MySQL database...");
    connection = await mysql.createConnection(DATABASE_CONFIG);
    console.log("✅ Connected to database");

    // First, get existing quotations
    const [quotations] = await connection.execute(
      "SELECT id, quote_number FROM quotations WHERE company_id = ? LIMIT 3",
      ["00000000-0000-0000-0000-000000000001"],
    );

    console.log(`📋 Found ${quotations.length} quotations`);

    // Get some products to use
    const [products] = await connection.execute(
      "SELECT id, name, sku, selling_price FROM products WHERE company_id = ? LIMIT 5",
      ["00000000-0000-0000-0000-000000000001"],
    );

    console.log(`📦 Found ${products.length} products`);

    if (quotations.length === 0 || products.length === 0) {
      console.log("❌ No quotations or products found");
      return;
    }

    // Add items to each quotation
    for (const quotation of quotations) {
      console.log(`\n💼 Adding items to quotation ${quotation.quote_number}`);

      // Check if quotation already has items
      const [existingItems] = await connection.execute(
        "SELECT COUNT(*) as count FROM quotation_items WHERE quotation_id = ?",
        [quotation.id],
      );

      if (existingItems[0].count > 0) {
        console.log(
          `⏭️ Quotation ${quotation.quote_number} already has items, skipping`,
        );
        continue;
      }

      // Add 2-3 random products to each quotation
      const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
      const selectedProducts = products.slice(0, numItems);

      let quotationTotal = 0;
      let quotationVatTotal = 0;

      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        const quantity = Math.floor(Math.random() * 5) + 1; // 1 to 5 quantity
        const unitPrice = parseFloat(product.selling_price) || 100;
        const discountPercentage = Math.floor(Math.random() * 11); // 0 to 10% discount
        const vatRate = 16; // Standard VAT rate in Kenya

        const subtotal = quantity * unitPrice;
        const discountAmount = (subtotal * discountPercentage) / 100;
        const taxableAmount = subtotal - discountAmount;
        const vatAmount = (taxableAmount * vatRate) / 100;
        const lineTotal = taxableAmount + vatAmount;

        quotationTotal += lineTotal;
        quotationVatTotal += vatAmount;

        // Insert quotation item
        await connection.execute(
          `
          INSERT INTO quotation_items (
            id, quotation_id, product_id, description, quantity, 
            unit_price, discount_percentage, discount_amount, 
            tax_rate, tax_amount, line_total, sort_order
          ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            quotation.id,
            product.id,
            product.name,
            quantity,
            unitPrice,
            discountPercentage,
            discountAmount,
            vatRate,
            vatAmount,
            lineTotal,
            i + 1,
          ],
        );

        console.log(
          `   ✅ Added: ${quantity}x ${product.name} @ ${unitPrice} = ${lineTotal.toFixed(2)}`,
        );
      }

      // Update quotation totals
      const subtotal = quotationTotal - quotationVatTotal;
      await connection.execute(
        `
        UPDATE quotations 
        SET subtotal = ?, tax_amount = ?, total_amount = ?
        WHERE id = ?
      `,
        [
          subtotal.toFixed(2),
          quotationVatTotal.toFixed(2),
          quotationTotal.toFixed(2),
          quotation.id,
        ],
      );

      console.log(
        `   💰 Updated totals: Subtotal: ${subtotal.toFixed(2)}, VAT: ${quotationVatTotal.toFixed(2)}, Total: ${quotationTotal.toFixed(2)}`,
      );
    }

    console.log("\n🎉 Successfully added quotation items!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

addQuotationItems();
