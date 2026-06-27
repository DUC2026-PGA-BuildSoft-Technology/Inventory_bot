const { query } = require('../config/db');

// Find user by Telegram ID
const findUserByTelegramId = async (telegramId) => {
  try {
    const result = await query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error finding user:', err);
    throw err;
  }
};

// Create new user in database
const createUser = async (telegramId, username, firstName, lastName) => {
  try {
    const result = await query(
      `INSERT INTO users (telegram_id, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [telegramId, username, firstName, lastName]
    );
    console.log(`✓ User saved: ${firstName}`);
    return result.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

// List all registered users
const listAllUsers = async () => {
  try {
    const result = await query(
      'SELECT id, telegram_id, username, first_name, last_name, role, status, created_at FROM users ORDER BY username ASC, first_name ASC'
    );
    return result.rows;
  } catch (err) {
    console.error('Error listing users:', err);
    throw err;
  }
};

// Update a user's role
const updateUserRole = async (userId, newRole) => {
  try {
    const result = await query(
      'UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [userId, newRole]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error updating user role:', err);
    throw err;
  }
};

// Update a user's status (active/banned)
const updateUserStatus = async (userId, newStatus) => {
  try {
    const result = await query(
      'UPDATE users SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
      [userId, newStatus]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error updating user status:', err);
    throw err;
  }
};

// Delete a user permanently
const deleteUser = async (userId) => {
  try {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};

const getUserSalesHistory = async (userId) => {
  const result = await query(
    `SELECT s.quantity, s.total_price, s.sold_at, p.product_name, p.barcode
     FROM sales s
     JOIN products p ON s.product_id = p.id
     WHERE s.user_id = $1
     ORDER BY s.sold_at DESC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
};

const getUserStockHistory = async (userId) => {
  const result = await query(
    `SELECT sl.action_type, sl.quantity_changed, sl.note, sl.created_at, p.product_name, p.barcode
     FROM stock_logs sl
     JOIN products p ON sl.product_id = p.id
     WHERE sl.user_id = $1
     ORDER BY sl.created_at DESC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
};

const getGlobalHistory = async () => {
  const result = await query(
    `SELECT 'sale' AS type, s.sold_at AS date, p.product_name, s.quantity::text AS details, u.first_name || ' ' || COALESCE(u.last_name, '') AS done_by
     FROM sales s
     JOIN products p ON s.product_id = p.id
     LEFT JOIN users u ON s.user_id = u.id
     UNION ALL
     SELECT 'stock' AS type, sl.created_at AS date, p.product_name, sl.action_type || ' (' || sl.quantity_changed || ')' AS details, u.first_name || ' ' || COALESCE(u.last_name, '') AS done_by
     FROM stock_logs sl
     JOIN products p ON sl.product_id = p.id
     LEFT JOIN users u ON sl.user_id = u.id
     ORDER BY date DESC
     LIMIT 10`
  );
  return result.rows;
};

module.exports = {
  findUserByTelegramId,
  createUser,
  listAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserSalesHistory,
  getUserStockHistory,
  getGlobalHistory,
};
