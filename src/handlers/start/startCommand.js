const userService = require('../../services/userService');

const getStartKeyboard = (role) => {
  const keyboard = [
    [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
    [{ text: '📋 View Sale List', callback_data: 'sales_list_view' }],
  ];

  // Show report button for Owners/Admins
  if (role === 'owner' || role === 'admin') {
    keyboard.push([{ text: '📊 View Daily Report', callback_data: 'owner_report_view' }]);
  }

  return keyboard;
};

const registerStartCommand = (bot) => {
  bot.start(async (ctx) => {
    try {
      const firstName = ctx.from.first_name || 'Friend';
      const lastName = ctx.from.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      const role = user ? user.role : 'staff';

      const welcomeText = [
        '📋 <b>Main Menu</b>',
        '',
        `Welcome back, <b>${fullName}</b>!`, '\n',
        'Select an option from the menu below to manage your inventory.'
      ].join('\n');

      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: getStartKeyboard(role),
        },
      });
    } catch (err) {
      console.error('Error in /start:', err);
      await ctx.reply('Error occurred. Try again later.');
    }
  });

  // Action: Return to main menu
  bot.action('menu_view', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const firstName = ctx.from.first_name || 'Friend';
      const lastName = ctx.from.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      const role = user ? user.role : 'staff';

      const menuText = [
        '📋 <b>Main Menu</b>',
        '',
        `Welcome back, <b>${fullName}</b>!`, '\n',
        'Select an option from the menu below to manage your inventory.'
      ].join('\n');

      try {
        await ctx.editMessageText(menuText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: getStartKeyboard(role),
          },
        });
      } catch (e) {
        // Fallback in case of media message edit collisions
        await ctx.deleteMessage().catch(() => { });
        await ctx.reply(menuText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: getStartKeyboard(role),
          },
        });
      }
    } catch (err) {
      console.error('Error in menu_view action:', err);
      await ctx.answerCbQuery('Error loading menu');
    }
  });
};

module.exports = { registerStartCommand };
