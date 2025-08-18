#!/usr/bin/env node

// Simple test to create a customer via the API
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '+254-700-000000',
  kraPin: 'P999999999Z',
  addressLine1: '123 Test Street',
  city: 'Nairobi',
  postalCode: '00100',
  country: 'Kenya',
  creditLimit: 10000,
  paymentTerms: 30,
  isActive: true
};

async function testCustomerCreation() {
  try {
    const response = await fetch('http://localhost:8080/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-company-id': '00000000-0000-0000-0000-000000000001',
      },
      body: JSON.stringify(testCustomer)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Customer created successfully:', result);
    } else {
      console.error('❌ Customer creation failed:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

console.log('🧪 Testing customer creation...');
testCustomerCreation();
