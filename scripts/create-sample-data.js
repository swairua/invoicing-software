#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000/api';
const COMPANY_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

async function apiCall(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
      'x-user-id': USER_ID
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || 'Request failed'}`);
    }
    
    return result;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
}

async function createSampleCustomers() {
  console.log('🏢 Creating sample customers...');
  
  const customers = [
    {
      name: 'Acme Corporation Ltd',
      email: 'contact@acme.co.ke',
      phone: '+254712345678',
      kraPin: 'P051234567A',
      address: 'Westlands Avenue, Nairobi, Kenya',
      creditLimit: 500000,
      isActive: true
    },
    {
      name: 'Safari Digital Agency',
      email: 'info@safaridigital.co.ke',
      phone: '+254723456789',
      kraPin: 'P051234567B',
      address: 'Karen Road, Karen, Nairobi',
      creditLimit: 250000,
      isActive: true
    },
    {
      name: 'East Africa Logistics',
      email: 'orders@ealogistics.com',
      phone: '+254734567890',
      kraPin: 'P051234567C',
      address: 'Industrial Area, Mombasa Road, Nairobi',
      creditLimit: 750000,
      isActive: true
    }
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    try {
      const result = await apiCall('/customers', 'POST', customer);
      console.log(`✅ Created customer: ${customer.name}`);
      createdCustomers.push(result.data);
    } catch (error) {
      console.error(`❌ Failed to create customer ${customer.name}:`, error.message);
    }
  }
  
  return createdCustomers;
}

async function createSampleProducts() {
  console.log('📦 Creating sample products...');
  
  const products = [
    {
      name: 'Website Design Package',
      description: 'Professional website design and development service',
      sku: 'WEB-001',
      sellingPrice: 45000,
      costPrice: 25000,
      category: 'Services',
      unit: 'Package',
      stockQuantity: 100,
      isActive: true
    },
    {
      name: 'Digital Marketing Campaign',
      description: 'Monthly digital marketing and social media management',
      sku: 'MKT-002',
      sellingPrice: 25000,
      costPrice: 15000,
      category: 'Services',
      unit: 'Month',
      stockQuantity: 50,
      isActive: true
    },
    {
      name: 'Business Logo Design',
      description: 'Custom business logo design with brand guidelines',
      sku: 'DES-003',
      sellingPrice: 8500,
      costPrice: 4000,
      category: 'Design',
      unit: 'Piece',
      stockQuantity: 200,
      isActive: true
    }
  ];

  const createdProducts = [];
  for (const product of products) {
    try {
      const result = await apiCall('/products', 'POST', product);
      console.log(`✅ Created product: ${product.name}`);
      createdProducts.push(result.data);
    } catch (error) {
      console.error(`❌ Failed to create product ${product.name}:`, error.message);
    }
  }
  
  return createdProducts;
}

async function createSampleInvoices(customers, products) {
  console.log('📄 Creating sample invoices...');
  
  if (customers.length === 0 || products.length === 0) {
    console.log('⚠️ No customers or products available for invoice creation');
    return [];
  }

  const invoices = [
    {
      customerId: customers[0].id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      items: [
        {
          productId: products[0].id,
          quantity: 1,
          unitPrice: products[0].sellingPrice,
          discount: 0
        }
      ],
      notes: 'Website design project as discussed in our meeting.',
      termsAndConditions: 'Payment due within 30 days of invoice date.'
    },
    {
      customerId: customers[1].id,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days from now
      items: [
        {
          productId: products[1].id,
          quantity: 3,
          unitPrice: products[1].sellingPrice,
          discount: 5000
        },
        {
          productId: products[2].id,
          quantity: 1,
          unitPrice: products[2].sellingPrice,
          discount: 0
        }
      ],
      notes: '3-month digital marketing package with complimentary logo design.',
      termsAndConditions: 'Payment due within 30 days of invoice date.'
    }
  ];

  const createdInvoices = [];
  for (const invoice of invoices) {
    try {
      const result = await apiCall('/invoices', 'POST', invoice);
      console.log(`✅ Created invoice for ${customers.find(c => c.id === invoice.customerId)?.name}`);
      createdInvoices.push(result.data);
    } catch (error) {
      console.error(`❌ Failed to create invoice:`, error.message);
    }
  }
  
  return createdInvoices;
}

async function main() {
  try {
    console.log('🚀 Starting sample data creation...\n');
    
    const customers = await createSampleCustomers();
    console.log(`\n✅ Created ${customers.length} customers\n`);
    
    const products = await createSampleProducts();
    console.log(`\n✅ Created ${products.length} products\n`);
    
    const invoices = await createSampleInvoices(customers, products);
    console.log(`\n✅ Created ${invoices.length} invoices\n`);
    
    console.log('🎉 Sample data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${customers.length} customers`);
    console.log(`   • ${products.length} products`);
    console.log(`   • ${invoices.length} invoices`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
