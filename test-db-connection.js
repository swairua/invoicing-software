import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Testing connection to medplusafrica.com:3306...');
    const connection = await mysql.createConnection({
      host: 'medplusafrica.com',
      port: 3306,
      user: 'medplusa_invoicing',
      password: 'x2J2^CV%rwrhhsw6',
      database: 'medplusa_invoicing',
      ssl: {
        rejectUnauthorized: false,
      },
      connectTimeout: 15000,
    });
    
    console.log('✅ Connection successful!');
    const [result] = await connection.execute('SELECT NOW() as current_time');
    console.log('Current time:', result[0].current_time);
    
    // Test table access
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.length);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    return false;
  }
}

testConnection();
