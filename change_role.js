require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const changeUserRole = async () => {
  const args = process.argv.slice(2);
  const telegramIdText = args[0];
  const newRole = args[1];

  if (!telegramIdText || !newRole) {
    console.log('\n❌ Usage: node change_role.js [telegram_id] [role]');
    console.log('💡 Example: node change_role.js 123456789 owner');
    console.log('💡 Available Roles: seller, stock-manager, manager, owner\n');
    process.exit(1);
  }

  const telegramId = Number.parseInt(telegramIdText, 10);
  if (Number.isNaN(telegramId)) {
    console.error('❌ Error: Telegram ID must be a valid integer.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to database to update role for user ${telegramId}...`);
    
    // Check if user exists in the database
    const checkResult = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    if (checkResult.rows.length === 0) {
      console.error(`❌ Error: No user found with Telegram ID ${telegramId} in the database.`);
      console.error(`💡 Tip: Ask the user to send /start to the Telegram bot first to register in the system.`);
      process.exit(1);
    }

    const user = checkResult.rows[0];
    const oldRole = user.role;

    // Update the role in the database
    const updateResult = await pool.query(
      'UPDATE users SET role = $2, updated_at = NOW() WHERE telegram_id = $1 RETURNING *',
      [telegramId, newRole]
    );

    const updatedUser = updateResult.rows[0];
    console.log('\n✅ User role updated successfully!');
    console.log('-----------------------------------');
    console.log(`👤 Name:     ${updatedUser.first_name} ${updatedUser.last_name || ''}`);
    console.log(`💬 Username: @${updatedUser.username || 'Unknown'}`);
    console.log(`🆔 ID:       ${updatedUser.telegram_id}`);
    console.log(`🔄 Role:     ${oldRole} ➔ ${updatedUser.role}`);
    console.log('-----------------------------------\n');

  } catch (err) {
    console.error('❌ Database error occurred:', err.message);
  } finally {
    await pool.end();
  }
};

changeUserRole();
