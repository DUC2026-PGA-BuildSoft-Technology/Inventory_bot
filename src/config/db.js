require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || '';
const isPlaceholder = databaseUrl.includes(':password@') || databaseUrl === 'your_database_url_here';
const useMock = isPlaceholder || process.env.USE_MOCKS === 'true';

let pool;
let query;
let mockDb;

if (useMock) {
  console.warn('\n⚠️  WARNING: DATABASE_URL is not configured or is using default placeholder credentials.');
  console.warn('🔌 Falling back to In-Memory Mock Database for local development.\n');

  // Load the mock database implementation
  mockDb = require('./mockDb');
  
  // Create a dummy pool object matching the telegraf/pg interface expected by health checks
  pool = {
    on: () => {},
    query: async (text, params) => {
      return mockDb.query(text, params);
    },
    connect: async () => {
      return {
        query: async (text, params) => {
          return mockDb.query(text, params);
        },
        release: () => {}
      };
    }
  };

  query = async (text, params) => {
    return mockDb.query(text, params);
  };
} else {
  // PostgreSQL connection pool
  pool = new Pool({
    connectionString: databaseUrl,
  });

  pool.on('connect', () => {
    console.log('✓ Database connected');
  });

  pool.on('error', (err) => {
    console.error('Database error:', err);
  });

  // Execute query
  query = async (text, params) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Query error:', err);
      throw err;
    }
  };
}

module.exports = {
  pool,
  query,
  useMock,
};
