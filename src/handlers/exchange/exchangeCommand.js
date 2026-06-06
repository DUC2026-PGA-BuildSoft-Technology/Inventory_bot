const apiService = require('../../services/apiService');

const registerExchangeCommand = (bot) => {
  bot.command('exchange', async (ctx) => {
    try {
      const res = await apiService.getExchangeRate();

      if (!res.success) {
        await ctx.reply('Unable to retrieve exchange rate. Please try again later.');
        return;
      }

      const rate = res.rate;

      const message = [
        'USD → KHR Exchange Rate',
        '',
        `1 USD = ${Number(rate).toLocaleString('en-US')} KHR`,
      ].join('\n');

      await ctx.reply(message);
    } catch (err) {
      console.error('Error in /exchange:', err);
      await ctx.reply('Unable to retrieve exchange rate. Please try again later.');
    }
  });
};

module.exports = { registerExchangeCommand };
