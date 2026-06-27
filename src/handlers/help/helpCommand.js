const { mainReplyKeyboard } = require('../menu/keyboardHandler');

const registerHelpCommand = (bot) => {
  bot.help(async (ctx) => {
    await ctx.reply(
      [
        'Smart Inventory Stock Bot commands:',
        '',
        '/view_catalog - Show live product catalog from database',
        '/check_stock [barcode] - Check stock for one product',
        '/sell [barcode] [qty] - Record a sale and reduce stock',
        '/update_stock [barcode] [qty] - Add or subtract stock',
        '/start - Register your Telegram account',
        '/help - Show this command menu',
      ].join('\n'),
      {
        reply_markup: mainReplyKeyboard
      }
    );
  });
};

module.exports = { registerHelpCommand };
