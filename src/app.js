require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const { startBot } = require('./bot/bot');
const { pool, query } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

const normalizeStatus = (stockQuantity) => {
  if (Number(stockQuantity) <= 0) return 'out_of_stock';
  if (Number(stockQuantity) <= 5) return 'low_stock';
  return 'active';
};

const ensureSchema = async () => {
  await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`);
  await query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'staff'`);
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'dashboard')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard', 'index.html'));
});

app.get('/health/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'PostgreSQL', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.get('/api/overview', async (_req, res) => {
  try {
    const [productsResult, lowStockResult, outOfStockResult, adminsResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total_products FROM products'),
      pool.query("SELECT COUNT(*)::int AS low_stock FROM products WHERE status = 'low_stock'"),
      pool.query("SELECT COUNT(*)::int AS out_of_stock FROM products WHERE status = 'out_of_stock'"),
      pool.query("SELECT COUNT(*)::int AS total_admins FROM users WHERE role IN ('seller','manager')"),
    ]);

    res.json({
      totalProducts: productsResult.rows[0].total_products,
      lowStock: lowStockResult.rows[0].low_stock,
      outOfStock: outOfStockResult.rows[0].out_of_stock,
      totalAdmins: adminsResult.rows[0].total_admins,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to load overview' });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, barcode, product_name, category, color, size, stock_quantity, price, status, image_url, created_at
      FROM products
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const body = req.body || {};
    const stockQuantity = Number(body.stock_quantity || 0);
    const status = body.status || normalizeStatus(stockQuantity);

    const result = await pool.query(
      `INSERT INTO products (barcode, product_name, category, color, size, stock_quantity, price, status, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        body.barcode,
        body.product_name,
        body.category || 'General',
        body.color || '',
        body.size || '',
        stockQuantity,
        Number(body.price || 0),
        status,
        body.image_url || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const body = req.body || {};
    const stockQuantity = Number(body.stock_quantity || 0);
    const status = body.status || normalizeStatus(stockQuantity);

    const result = await pool.query(
      `UPDATE products
       SET barcode = $1,
           product_name = $2,
           category = $3,
           color = $4,
           size = $5,
           stock_quantity = $6,
           price = $7,
           status = $8,
           image_url = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        body.barcode,
        body.product_name,
        body.category || 'General',
        body.color || '',
        body.size || '',
        stockQuantity,
        Number(body.price || 0),
        status,
        body.image_url || null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    res.json({ status: 'ok', message: 'Product removed' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to remove product' });
  }
});

app.get('/api/admins', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, telegram_id, username, first_name, last_name, role, created_at
      FROM users
      WHERE role IN ('seller','manager')
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Admins fetch error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to fetch admins' });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const body = req.body || {};
    const role = (body.role || 'seller').toLowerCase();
    const telegramId = body.telegram_id;

    if (!telegramId) {
      return res.status(400).json({ status: 'error', message: 'Telegram ID is required' });
    }

    const result = await pool.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (telegram_id) DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         role = EXCLUDED.role,
         updated_at = NOW()
       RETURNING *`,
      [telegramId, body.username || null, body.first_name || 'Admin', body.last_name || '', role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Admin create error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to save admin' });
  }
});

app.delete('/api/admins/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }

    res.json({ status: 'ok', message: 'Admin removed' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to remove admin' });
  }
});

app.post('/api/upload-image', async (req, res) => {
  try {
    const { image_base64 } = req.body || {};
    if (!image_base64) {
      return res.status(400).json({ status: 'error', message: 'No image supplied' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(400).json({ status: 'error', message: 'Cloudinary is not configured yet' });
    }

    const base64Data = image_base64.includes(',') ? image_base64.split(',')[1] : image_base64;
    const timestamp = Math.round(Date.now() / 1000);
    const params = `folder=inventory-bot/products&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(params + process.env.CLOUDINARY_API_SECRET).digest('hex');

    const form = new URLSearchParams();
    form.append('file', `data:image/jpeg;base64,${base64Data}`);
    form.append('api_key', process.env.CLOUDINARY_API_KEY);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);
    form.append('folder', 'inventory-bot/products');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      return res.status(500).json({ status: 'error', message: 'Cloudinary upload failed' });
    }

    return res.json({ status: 'ok', image_url: result.secure_url });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ status: 'error', message: 'Unable to upload image' });
  }
});

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

const startServer = async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && !token.includes('your_telegram_bot_token')) {
      await startBot();
    } else {
      console.log('ℹ Telegram bot skipped because no valid token is configured');
    }
  } catch (err) {
    console.error('Error starting:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
