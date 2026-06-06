const userService = require('../../services/userService');

const registerStartCommand = (bot) => {
  bot.start(async (ctx) => {
    try {
      const firstName = ctx.from.first_name || 'Friend';
      const { user, isNew } = await userService.findOrCreateUserByTelegram(ctx);

      if (user) {
        const welcomeText = isNew
          ? `Welcome ${firstName}! 👋\n\nWelcome to Smart Inventory Stock Bot! Check your stock items and manage inventory easily.`
          : `Welcome back ${firstName}! 👋\n\nThank you for using Smart Inventory Stock Bot! We're happy to see you again.`;

        await ctx.reply(welcomeText);
      } else {
        await ctx.reply('Welcome! Your account could not be created right now. Please try again later.');
      }
    } catch (err) {
      console.error('Error in /start:', err);
      await ctx.reply('Error occurred. Try again later.');
    }
  });
};

module.exports = { registerStartCommand };
