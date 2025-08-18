import database from '../server/database.js';

async function createSampleData() {
  try {
    console.log('🔄 Creating sample data...');
    await database.createSampleData();
    console.log('✅ Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
