const registerMenuCommand = (bot) => {
  bot.command('menu', async (ctx) => {
    await ctx.reply(
      [
        '📋 Command Menu',
        '',
        '/start - Open the bot menu and register your account',
        '/help - Show help information',
        '/view_catalog - Show the live product catalog',
        '/check_stock [barcode] - Check stock by barcode',
        '/sell [barcode] [qty] - Record a sale',
        '/update_stock [barcode] [qty] - Adjust inventory stock',
      ].join('\n')
    );
  });
};

module.exports = { registerMenuCommand };
