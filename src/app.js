require('dotenv').config();
const express = require('express');
const { startBot } = require('./bot/bot');
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Bot is running' });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'PostgreSQL', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

// Start server and bot
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
    await startBot();
  } catch (err) {
    console.error('Error starting:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
