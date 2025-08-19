import { Router } from "express";
import customerRepository from "../repositories/customerRepository";
import productRepository from "../repositories/productRepository";

const router = Router();

// Seed sample data endpoint
router.post("/sample-data", async (req, res) => {
  try {
    let companyId = req.headers["x-company-id"] as string;
    const userId =
      (req.headers["x-user-id"] as string) ||
      "550e8400-e29b-41d4-a716-446655440001";

    // If no company ID provided, get the first company from database
    if (!companyId) {
      const companyResult = await customerRepository.db.query(
        "SELECT id FROM companies LIMIT 1",
      );
      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].id;
        console.log("🏢 Using existing company ID:", companyId);
      } else {
        return res.status(400).json({
          success: false,
          error: "No company found in database. Please create a company first.",
        });
      }
    }

    console.log("🚀 Starting sample data creation...");

    // Sample customers
    const customers = [
      {
        name: "Acme Corporation Ltd",
        email: "contact@acme.co.ke",
        phone: "+254712345678",
        kraPin: "P051234567A",
        address: "Westlands Avenue, Nairobi, Kenya",
        creditLimit: 500000,
        isActive: true,
        companyId,
      },
      {
        name: "Safari Digital Agency",
        email: "info@safaridigital.co.ke",
        phone: "+254723456789",
        kraPin: "P051234567B",
        address: "Karen Road, Karen, Nairobi",
        creditLimit: 250000,
        isActive: true,
        companyId,
      },
      {
        name: "East Africa Logistics",
        email: "orders@ealogistics.com",
        phone: "+254734567890",
        kraPin: "P051234567C",
        address: "Industrial Area, Mombasa Road, Nairobi",
        creditLimit: 750000,
        isActive: true,
        companyId,
      },
    ];

    // Sample products
    const products = [
      {
        name: "Website Design Package",
        description: "Professional website design and development service",
        sku: "WEB-001",
        sellingPrice: 45000,
        costPrice: 25000,
        category: "Services",
        unit: "Package",
        currentStock: 100,
        isActive: true,
        companyId,
      },
      {
        name: "Digital Marketing Campaign",
        description: "Monthly digital marketing and social media management",
        sku: "MKT-002",
        sellingPrice: 25000,
        costPrice: 15000,
        category: "Services",
        unit: "Month",
        currentStock: 50,
        isActive: true,
        companyId,
      },
      {
        name: "Business Logo Design",
        description: "Custom business logo design with brand guidelines",
        sku: "DES-003",
        sellingPrice: 8500,
        costPrice: 4000,
        category: "Design",
        unit: "Piece",
        currentStock: 200,
        isActive: true,
        companyId,
      },
    ];

    // Create customers
    console.log("🏢 Creating sample customers...");
    const createdCustomers = [];
    for (const customer of customers) {
      try {
        const result = await customerRepository.create(customer);
        console.log(`✅ Created customer: ${customer.name}`);
        createdCustomers.push(result);
      } catch (error) {
        console.error(`❌ Failed to create customer ${customer.name}:`, error);
      }
    }

    // Create products
    console.log("📦 Creating sample products...");
    const createdProducts = [];
    for (const product of products) {
      try {
        const result = await productRepository.create(product);
        console.log(`✅ Created product: ${product.name}`);
        createdProducts.push(result);
      } catch (error) {
        console.error(`❌ Failed to create product ${product.name}:`, error);
      }
    }

    // Create sample invoices with proper statuses for dashboard metrics
    console.log("💰 Creating sample invoices for dashboard metrics...");
    const createdInvoices = [];

    if (createdCustomers.length > 0) {
      const sampleInvoices = [
        {
          customerId: createdCustomers[0].id,
          invoiceNumber: "INV-2025-001",
          status: "paid",
          issueDate: "2025-01-15",
          dueDate: "2025-02-14",
          subtotal: 12931.03,
          taxAmount: 2068.97,
          totalAmount: 15000.0,
          currency: "KES",
        },
        {
          customerId: createdCustomers[1]?.id || createdCustomers[0].id,
          invoiceNumber: "INV-2025-002",
          status: "paid",
          issueDate: "2025-01-10",
          dueDate: "2025-02-09",
          subtotal: 7327.59,
          taxAmount: 1172.41,
          totalAmount: 8500.0,
          currency: "KES",
        },
        {
          customerId: createdCustomers[2]?.id || createdCustomers[0].id,
          invoiceNumber: "INV-2025-003",
          status: "sent",
          issueDate: "2025-01-18",
          dueDate: "2025-02-17",
          subtotal: 10344.83,
          taxAmount: 1655.17,
          totalAmount: 12000.0,
          currency: "KES",
        },
        {
          customerId: createdCustomers[0].id,
          invoiceNumber: "INV-2025-004",
          status: "overdue",
          issueDate: "2024-12-15",
          dueDate: "2025-01-14",
          subtotal: 6465.52,
          taxAmount: 1034.48,
          totalAmount: 7500.0,
          currency: "KES",
        },
        {
          customerId: createdCustomers[1]?.id || createdCustomers[0].id,
          invoiceNumber: "INV-2025-005",
          status: "sent",
          issueDate: "2025-01-12",
          dueDate: "2025-02-11",
          subtotal: 8448.28,
          taxAmount: 1351.72,
          totalAmount: 9800.0,
          currency: "KES",
        },
      ];

      for (const invoice of sampleInvoices) {
        try {
          const invoiceResult = await customerRepository.db.query(
            `
            INSERT INTO invoices (
              id, company_id, customer_id, invoice_number, status,
              issue_date, due_date, subtotal, tax_amount, total_amount,
              currency, created_by, created_at, updated_at
            ) VALUES (
              UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
          `,
            [
              companyId,
              invoice.customerId,
              invoice.invoiceNumber,
              invoice.status,
              invoice.issueDate,
              invoice.dueDate,
              invoice.subtotal,
              invoice.taxAmount,
              invoice.totalAmount,
              invoice.currency,
              userId,
            ],
          );
          console.log(
            `✅ Created invoice: ${invoice.invoiceNumber} (${invoice.status}) - KES ${invoice.totalAmount}`,
          );
          createdInvoices.push(invoice);
        } catch (error) {
          console.error(
            `❌ Failed to create invoice ${invoice.invoiceNumber}:`,
            error.message,
          );
        }
      }
    }

    // Create sample payments for dashboard metrics
    console.log("💳 Creating sample payments for dashboard metrics...");
    const createdPayments = [];

    if (createdCustomers.length > 0) {
      const samplePayments = [
        {
          customerId: createdCustomers[0].id,
          amount: 15000.0,
          paymentMethod: "bank_transfer",
          paymentDate: "2025-01-20",
          status: "completed",
        },
        {
          customerId: createdCustomers[1]?.id || createdCustomers[0].id,
          amount: 8500.0,
          paymentMethod: "cash",
          paymentDate: "2025-01-15",
          status: "completed",
        },
        {
          customerId: createdCustomers[2]?.id || createdCustomers[0].id,
          amount: 5000.0,
          paymentMethod: "mpesa",
          paymentDate: "2025-01-22",
          status: "completed",
        },
        {
          customerId: createdCustomers[0].id,
          amount: 3200.0,
          paymentMethod: "bank_transfer",
          paymentDate: "2025-01-25",
          status: "completed",
        },
      ];

      for (const payment of samplePayments) {
        try {
          const paymentNumber = `PAY-2025-${String(createdPayments.length + 1).padStart(3, "0")}`;
          await customerRepository.db.query(
            `
            INSERT INTO payments (
              id, company_id, customer_id, payment_number, amount, payment_method,
              payment_date, status, created_by, created_at, updated_at
            ) VALUES (
              UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
          `,
            [
              companyId,
              payment.customerId,
              paymentNumber,
              payment.amount,
              payment.paymentMethod,
              payment.paymentDate,
              payment.status,
              userId,
            ],
          );
          console.log(
            `✅ Created payment: KES ${payment.amount} via ${payment.paymentMethod}`,
          );
          createdPayments.push(payment);
        } catch (error) {
          console.error(`❌ Failed to create payment:`, error.message);
        }
      }
    }

    console.log("🎉 Sample data creation completed successfully!");

    res.json({
      success: true,
      message: "Sample data created successfully with dashboard metrics",
      data: {
        customers: createdCustomers.length,
        products: createdProducts.length,
        invoices: createdInvoices.length,
        payments: createdPayments.length,
        details: {
          customers: createdCustomers,
          products: createdProducts,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create sample data",
      details: error.message,
    });
  }
});

// Clear all sample data endpoint (for testing)
router.delete("/sample-data", async (req, res) => {
  try {
    console.log("🧹 Clearing sample data...");

    // Note: This is a basic implementation
    // In production, you'd want more sophisticated cleanup

    res.json({
      success: true,
      message: "Sample data cleared (implementation needed)",
    });
  } catch (error) {
    console.error("❌ Error clearing sample data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear sample data",
      details: error.message,
    });
  }
});

export default router;
