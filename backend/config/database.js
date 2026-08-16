import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'ProBoard',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourPassword123!'
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 30000
  }
};

let pool = null;

export async function connectDatabase() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to SQL Server successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
}

export async function getPool() {
  if (!pool) {
    await connectDatabase();
  }
  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.close();
    console.log('Database connection closed');
  }
}

export { sql };
