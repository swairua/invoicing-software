import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('🔄 Testing MySQL connection...');
    
    const connection = await mysql.createConnection({
      host: 'mysql-242eb3d7-invoicing-software.c.aivencloud.com',
      port: 11401,
      user: 'avnadmin',
      password: 'AVNS_x9WdjKNy72pMT6Zr90I',
      database: 'defaultdb',
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ Connection established');
    
    const [result] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query successful:', result);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
