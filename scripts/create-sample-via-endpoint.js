#!/usr/bin/env node

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data via API endpoint...');
    
    const response = await fetch('http://localhost:8080/api/create-sample-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-company-id': '00000000-0000-0000-0000-000000000001',
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Sample data created successfully!');
      console.log('📊 Summary:', result.summary);
      console.log('👥 Customers created:', result.data.customers.length);
      console.log('🏥 Products created:', result.data.products.length);
    } else {
      console.error('❌ Failed to create sample data:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

createSampleData();
