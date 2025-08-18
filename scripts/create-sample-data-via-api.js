#!/usr/bin/env node
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080/api';
const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

async function apiCall(endpoint, method = 'GET', data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-company-id': COMPANY_ID,
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  console.log(`Making ${method} request to ${url}`);
  if (data) console.log('Data:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    console.log('✅ Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function createSampleCustomers() {
  console.log('\n📋 Creating sample customers...');
  
  const customers = [
    {
      name: 'Nairobi Medical Center',
      email: 'procurement@nairobimedical.co.ke',
      phone: '+254-700-123456',
      kraPin: 'P051234567X',
      addressLine1: '123 Uhuru Highway',
      addressLine2: 'Medical Plaza, 5th Floor',
      city: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
      creditLimit: 500000,
      paymentTerms: 30,
      isActive: true
    },
    {
      name: 'Coast General Hospital',
      email: 'supplies@coastgeneral.co.ke',
      phone: '+254-722-987654',
      kraPin: 'P052345678Y',
      addressLine1: '456 Moi Avenue',
      addressLine2: 'Hospital Complex',
      city: 'Mombasa',
      postalCode: '80100',
      country: 'Kenya',
      creditLimit: 300000,
      paymentTerms: 14,
      isActive: true
    }
  ];

  for (const customer of customers) {
    await apiCall('/customers', 'POST', customer);
  }
}

async function createSampleProducts() {
  console.log('\n🏥 Creating sample products...');
  
  const products = [
    {
      name: 'Latex Rubber Gloves Bicolor Reusable XL',
      description: 'High-quality latex rubber gloves for medical and industrial use. Bicolor design for enhanced grip and visibility.',
      sku: 'LRG-XL-001',
      barcode: '1234567890123',
      unit: 'Pair',
      purchasePrice: 400,
      sellingPrice: 500,
      wholesalePrice: 450,
      retailPrice: 500,
      minStock: 50,
      maxStock: 1000,
      currentStock: 450,
      reorderLevel: 100,
      location: 'A1-B2',
      trackInventory: true,
      taxable: true,
      taxRate: 16,
      isActive: true,
      hasVariants: false,
      allowBackorders: true,
      weight: 0.15,
      tags: 'medical,gloves,protective,latex'
    },
    {
      name: 'Digital Blood Pressure Monitor',
      description: 'Accurate digital blood pressure monitoring device with large LCD display and memory function.',
      sku: 'DBP-001',
      barcode: '2345678901234',
      unit: 'Piece',
      purchasePrice: 2500,
      sellingPrice: 3500,
      wholesalePrice: 3000,
      retailPrice: 3500,
      minStock: 5,
      maxStock: 100,
      currentStock: 25,
      reorderLevel: 10,
      location: 'B2-C3',
      trackInventory: true,
      taxable: true,
      taxRate: 16,
      isActive: true,
      hasVariants: false,
      allowBackorders: false,
      weight: 0.8,
      tags: 'medical,monitor,blood pressure,digital'
    }
  ];

  for (const product of products) {
    await apiCall('/products', 'POST', product);
  }
}

async function createSampleCategories() {
  console.log('\n📁 Creating sample categories...');
  
  const categories = [
    {
      name: 'Medical Supplies',
      description: 'Basic medical supplies and consumables',
      isActive: true
    },
    {
      name: 'Medical Equipment',
      description: 'Medical devices and equipment',
      isActive: true
    }
  ];

  for (const category of categories) {
    try {
      await apiCall('/categories', 'POST', category);
    } catch (error) {
      console.log('⚠️ Category creation might not be available:', error.message);
    }
  }
}

async function main() {
  console.log('🚀 Creating sample data via API endpoints...');
  console.log('This simulates creating records through the forms.');
  
  try {
    // Test API connectivity first
    await apiCall('/test');
    
    // Create sample data
    await createSampleCategories();
    await createSampleCustomers();
    await createSampleProducts();
    
    console.log('\n✅ All sample data created successfully!');
    console.log('You can now view the records in the application.');
    
  } catch (error) {
    console.error('\n❌ Failed to create sample data:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createSampleCustomers, createSampleProducts, createSampleCategories };
