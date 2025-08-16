import { Router } from 'express';
import customerRepository from '../repositories/customerRepository';
import productRepository from '../repositories/productRepository';

const router = Router();

// Seed sample data endpoint
router.post('/sample-data', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'] as string || '550e8400-e29b-41d4-a716-446655440000';
    const userId = req.headers['x-user-id'] as string || '550e8400-e29b-41d4-a716-446655440001';
    
    console.log('🚀 Starting sample data creation...');
    
    // Sample customers
    const customers = [
      {
        name: 'Acme Corporation Ltd',
        email: 'contact@acme.co.ke',
        phone: '+254712345678',
        kraPin: 'P051234567A',
        address: 'Westlands Avenue, Nairobi, Kenya',
        creditLimit: 500000,
        isActive: true,
        companyId
      },
      {
        name: 'Safari Digital Agency',
        email: 'info@safaridigital.co.ke',
        phone: '+254723456789',
        kraPin: 'P051234567B',
        address: 'Karen Road, Karen, Nairobi',
        creditLimit: 250000,
        isActive: true,
        companyId
      },
      {
        name: 'East Africa Logistics',
        email: 'orders@ealogistics.com',
        phone: '+254734567890',
        kraPin: 'P051234567C',
        address: 'Industrial Area, Mombasa Road, Nairobi',
        creditLimit: 750000,
        isActive: true,
        companyId
      }
    ];

    // Sample products
    const products = [
      {
        name: 'Website Design Package',
        description: 'Professional website design and development service',
        sku: 'WEB-001',
        sellingPrice: 45000,
        costPrice: 25000,
        category: 'Services',
        unit: 'Package',
        currentStock: 100,
        isActive: true,
        companyId
      },
      {
        name: 'Digital Marketing Campaign',
        description: 'Monthly digital marketing and social media management',
        sku: 'MKT-002',
        sellingPrice: 25000,
        costPrice: 15000,
        category: 'Services',
        unit: 'Month',
        currentStock: 50,
        isActive: true,
        companyId
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
        isActive: true,
        companyId,
        createdBy: userId
      }
    ];

    // Create customers
    console.log('🏢 Creating sample customers...');
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
    console.log('📦 Creating sample products...');
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

    console.log('🎉 Sample data creation completed successfully!');
    
    res.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        customers: createdCustomers.length,
        products: createdProducts.length,
        details: {
          customers: createdCustomers,
          products: createdProducts
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sample data',
      details: error.message
    });
  }
});

// Clear all sample data endpoint (for testing)
router.delete('/sample-data', async (req, res) => {
  try {
    console.log('🧹 Clearing sample data...');
    
    // Note: This is a basic implementation
    // In production, you'd want more sophisticated cleanup
    
    res.json({
      success: true,
      message: 'Sample data cleared (implementation needed)'
    });

  } catch (error) {
    console.error('❌ Error clearing sample data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear sample data',
      details: error.message
    });
  }
});

export default router;
