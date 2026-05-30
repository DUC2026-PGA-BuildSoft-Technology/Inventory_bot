const { pool, query } = require('../config/db');

const LOW_STOCK_LIMIT = 5;

const listCatalogProducts = async () => {
  const result = await query(
    `SELECT id, barcode, product_name, category, color, size, stock_quantity, price, status
     FROM products
     ORDER BY category NULLS LAST, product_name ASC
     LIMIT 20`
  );

  return result.rows;
};

const findProductByBarcode = async (barcode) => {
  const result = await query(
    `SELECT id, barcode, product_name, category, color, size, stock_quantity, price, status
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
       RETURNING id, barcode, product_name, stock_quantity, status`,
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
       RETURNING id, barcode, product_name, stock_quantity, price, status`,
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

module.exports = {
  listCatalogProducts,
  findProductByBarcode,
  updateStockByBarcode,
  recordSaleByBarcode,
};
