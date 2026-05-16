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

module.exports = {
  findUserByTelegramId,
  createUser,
};
