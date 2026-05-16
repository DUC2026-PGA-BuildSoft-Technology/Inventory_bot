const { Telegraf } = require('telegraf');
const userModel = require('../models/userModel');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// /start command - Register user and send welcome message
bot.start(async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Friend';
    const username = ctx.from.username || 'Unknown';
    const lastName = ctx.from.last_name || '';

    // Check if user exists
    const existingUser = await userModel.findUserByTelegramId(telegramId);

    if (!existingUser) {
      // New user - save to database
      await userModel.createUser(telegramId, username, firstName, lastName);
    }

    // Send warm welcome message
    const warmWelcome = `Welcome ${firstName}! 👋\n\nWelcome to Smart Inventory Stock Bot! Check your stock items and manage inventory easily.`;
    await ctx.reply(warmWelcome);
  } catch (err) {
    console.error('Error in /start:', err);
    await ctx.reply('Error occurred. Try again later.');
  }
});

// Start bot
const startBot = async () => {
  try {
    console.log('🤖 Bot starting...');
    bot.launch();
    console.log('✓ Bot is running');
  } catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, startBot };
