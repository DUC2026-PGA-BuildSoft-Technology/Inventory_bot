const userModel = require('../../models/userModel');

const registerStartCommand = (bot) => {
  bot.start(async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      const firstName = ctx.from.first_name || 'Friend';
      const username = ctx.from.username || 'Unknown';
      const lastName = ctx.from.last_name || '';

      const existingUser = await userModel.findUserByTelegramId(telegramId);

      if (existingUser) {
        const welcomeBack = `Welcome back ${firstName}! 👋\n\nThank you for using Smart Inventory Stock Bot! We're happy to see you again.`;
        await ctx.reply(welcomeBack);
      } else {
        await userModel.createUser(telegramId, username, firstName, lastName);

        const firstWelcome = `Welcome ${firstName}! 👋\n\nWelcome to Smart Inventory Stock Bot! Check your stock items and manage inventory easily.`;
        await ctx.reply(firstWelcome);
      }
    } catch (err) {
      console.error('Error in /start:', err);
      await ctx.reply('Error occurred. Try again later.');
    }
  });
};

module.exports = { registerStartCommand };
