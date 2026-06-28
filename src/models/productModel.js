const { pool, query } = require('../config/db');

const LOW_STOCK_LIMIT = 5;

const listCatalogProducts = async () => {
  const result = await query(
    `SELECT id, barcode, product_name, category, color, size, stock_quantity, price, status, image_url
     FROM products
     ORDER BY category NULLS LAST, product_name ASC
     LIMIT 20`
  );

  return result.rows;
};

const findProductByBarcode = async (barcode) => {
  const result = await query(
    `SELECT id, barcode, product_name, category, color, size, stock_quantity, price, status, image_url
     FROM products
     WHERE barcode = $1`,
    [barcode]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

const updateStockByBarcode = async (barcode, quantity, userId, note = 'Manual stock update') => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity + $2,
           status = CASE
             WHEN stock_quantity + $2 <= 0 THEN 'out_of_stock'
             WHEN stock_quantity + $2 <= $3 THEN 'low_stock'
             ELSE 'active'
           END,
           updated_at = NOW()
       WHERE barcode = $1
         AND stock_quantity + $2 >= 0
       RETURNING id, barcode, product_name, stock_quantity, status, image_url`,
      [barcode, quantity, LOW_STOCK_LIMIT]
    );

    if (productResult.rows.length === 0) {
      const existingProduct = await client.query(
        'SELECT id, product_name, stock_quantity FROM products WHERE barcode = $1',
        [barcode]
      );

      await client.query('ROLLBACK');

      if (existingProduct.rows.length === 0) {
        return { status: 'not_found' };
      }

      return { status: 'insufficient_stock', product: existingProduct.rows[0] };
    }

    const product = productResult.rows[0];

    await client.query(
      `INSERT INTO stock_logs (product_id, user_id, action_type, quantity_changed, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [product.id, userId, quantity >= 0 ? 'stock_in' : 'stock_out', quantity, note]
    );

    if (product.stock_quantity <= LOW_STOCK_LIMIT) {
      await client.query(
        `INSERT INTO notifications (product_id, message, status)
         VALUES ($1, $2, 'unread')`,
         [product.id, `${product.product_name} is low stock: ${product.stock_quantity} left`]
      );
    }

    await client.query('COMMIT');
    return { status: 'updated', product };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const recordSaleByBarcode = async (barcode, quantity, userId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      `SELECT id, barcode, product_name, stock_quantity, price
       FROM products
       WHERE barcode = $1
       FOR UPDATE`,
      [barcode]
    );

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { status: 'not_found' };
    }

    const product = productResult.rows[0];

    if (product.stock_quantity < quantity) {
      await client.query('ROLLBACK');
      return { status: 'insufficient_stock', product };
    }

    const totalPrice = Number(product.price) * quantity;

    await client.query(
      `INSERT INTO sales (product_id, user_id, quantity, total_price)
       VALUES ($1, $2, $3, $4)`,
      [product.id, userId, quantity, totalPrice]
    );

    const updatedResult = await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $2,
           status = CASE
             WHEN stock_quantity - $2 <= 0 THEN 'out_of_stock'
             WHEN stock_quantity - $2 <= $3 THEN 'low_stock'
             ELSE 'active'
           END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, barcode, product_name, stock_quantity, price, status, image_url`,
      [product.id, quantity, LOW_STOCK_LIMIT]
    );

    const updatedProduct = updatedResult.rows[0];

    await client.query(
      `INSERT INTO stock_logs (product_id, user_id, action_type, quantity_changed, note)
       VALUES ($1, $2, 'sale', $3, $4)`,
      [product.id, userId, -quantity, `Sale recorded from Telegram command`]
    );

    if (updatedProduct.stock_quantity <= LOW_STOCK_LIMIT) {
      await client.query(
        `INSERT INTO notifications (product_id, message, status)
         VALUES ($1, $2, 'unread')`,
        [product.id, `${updatedProduct.product_name} is low stock: ${updatedProduct.stock_quantity} left`]
      );
    }

    await client.query('COMMIT');

    return {
      status: 'sold',
      product: updatedProduct,
      quantity,
      totalPrice,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateProductField = async (barcode, field, value) => {
  const allowedFields = ['product_name', 'category', 'color', 'size', 'price', 'image_url'];
  if (!allowedFields.includes(field)) {
    throw new Error(`Field ${field} is not allowed for update`);
  }

  const queryText = `
    UPDATE products
    SET ${field} = $2, updated_at = NOW()
    WHERE barcode = $1
    RETURNING id, barcode, product_name, category, color, size, stock_quantity, price, status, image_url;
  `;
  const result = await query(queryText, [barcode, value]);
  const product = result.rows.length > 0 ? result.rows[0] : null;

  if (product) {
    await query(
      `INSERT INTO stock_logs (product_id, user_id, action_type, quantity_changed, note)
       VALUES ($1, null, 'update_product', 0, $2)`,
      [product.id, `Updated ${field} to ${value}`]
    ).catch((e) => console.error('Error logging product update:', e));
  }

  return product;
};

const deleteProduct = async (barcode) => {
  const product = await findProductByBarcode(barcode);
  if (product) {
    const deletionsPath = require('path').join(__dirname, 'deletions.json');
    const fs = require('fs');
    let deletions = [];
    try {
      deletions = JSON.parse(fs.readFileSync(deletionsPath, 'utf8'));
    } catch (e) {}
    deletions.push({
      product_name: product.product_name,
      barcode: product.barcode,
      deleted_at: new Date().toISOString()
    });
    try {
      fs.writeFileSync(deletionsPath, JSON.stringify(deletions, null, 2));
    } catch (e) {
      console.error('Error writing deletions.json:', e);
    }
  }

  const result = await query(
    `DELETE FROM products WHERE barcode = $1 RETURNING *`,
    [barcode]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

const getStockMovementReport = async (timeframe) => {
  let intervalFilter = 'CURRENT_DATE';
  if (timeframe === 'weekly') {
    intervalFilter = "CURRENT_DATE - INTERVAL '7 days'";
  } else if (timeframe === 'monthly') {
    intervalFilter = "CURRENT_DATE - INTERVAL '30 days'";
  }

  // 1. Get recent stock logs
  const logsSql = `
    SELECT 
      sl.action_type, 
      sl.quantity_changed, 
      sl.note, 
      sl.created_at, 
      p.product_name, 
      p.barcode
    FROM stock_logs sl
    JOIN products p ON sl.product_id = p.id
    WHERE sl.created_at >= ${intervalFilter}
    ORDER BY sl.created_at DESC;
  `;
  const logsResult = await query(logsSql);

  // 2. Get currently low stock items (stock_quantity <= 5)
  const lowStockSql = `
    SELECT product_name, barcode, stock_quantity 
    FROM products 
    WHERE stock_quantity <= 5
    ORDER BY stock_quantity ASC;
  `;
  const lowStockResult = await query(lowStockSql);

  // 3. Read deleted products list
  const deletionsPath = require('path').join(__dirname, 'deletions.json');
  const fs = require('fs');
  let deletions = [];
  try {
    deletions = JSON.parse(fs.readFileSync(deletionsPath, 'utf8'));
  } catch (e) {}

  // Filter deletions by timeframe
  const limitDate = new Date();
  if (timeframe === 'weekly') {
    limitDate.setDate(limitDate.getDate() - 7);
  } else if (timeframe === 'monthly') {
    limitDate.setDate(limitDate.getDate() - 30);
  } else {
    // daily: since midnight
    limitDate.setHours(0, 0, 0, 0);
  }

  const filteredDeletions = deletions.filter(d => new Date(d.deleted_at) >= limitDate);

  return {
    logs: logsResult.rows,
    lowStock: lowStockResult.rows,
    deletions: filteredDeletions
  };
};

const createProduct = async (details) => {
  try {
    const { barcode, product_name, category, color, size, stock_quantity, price, image_url } = details;
    const sql = `
      INSERT INTO products (barcode, product_name, category, color, size, stock_quantity, price, status, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
      RETURNING *
    `;
    const result = await query(sql, [barcode, product_name, category, color || '', size || '', stock_quantity, price, image_url || '']);
    const product = result.rows.length > 0 ? result.rows[0] : null;

    if (product) {
      await query(
        `INSERT INTO stock_logs (product_id, user_id, action_type, quantity_changed, note)
         VALUES ($1, $2, 'add_product', $3, $4)`,
        [product.id, details.user_id || null, product.stock_quantity, `New product created: ${product_name}`]
      ).catch((e) => console.error('Error logging add_product:', e));
    }

    return product;
  } catch (err) {
    console.error('Error creating product:', err);
    throw err;
  }
};

module.exports = {
  listCatalogProducts,
  findProductByBarcode,
  updateStockByBarcode,
  recordSaleByBarcode,
  updateProductField,
  deleteProduct,
  getStockMovementReport,
  createProduct,
};
