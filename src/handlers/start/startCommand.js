const userService = require('../../services/userService');
const { mainReplyKeyboard } = require('../menu/keyboardHandler');

const getStartKeyboard = (role) => {
  const keyboard = [
    [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
    [{ text: '📋 View Sale List', callback_data: 'sales_list_view' }],
  ];

  // Show report and user management buttons for Owners/Managers/Admins
  if (role === 'owner' || role === 'manager' || role === 'admin') {
    keyboard.push([{ text: '📊 View Reports', callback_data: 'reports_dashboard_view' }]);
    keyboard.push([{ text: '👤 Manage Users', callback_data: 'users_manage_view' }]);
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
      const role = user ? user.role : 'seller';

      // Initialize and display the bottom reply keyboard
      await ctx.reply(`Welcome!! ${fullName}!!`, {
        reply_markup: mainReplyKeyboard,
      });

      const welcomeText = [
        '📋 <b>Smart-Stock Inventory</b>',
        '━━━━━━━━━━━━━━━━━━',
        `👤 <b>User:</b> ${fullName}`,
        `🏢 <b>Project:</b> Smart-Stock Inventory`,
        '━━━━━━━━━━━━━━━━━━',
        '',
        'Select an administrative task from the menu below:'
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
      const role = user ? user.role : 'seller';

      const menuText = [
        '📋 <b>Smart-Stock Inventory</b>',
        '━━━━━━━━━━━━━━━━━━',
        `👤 <b>User:</b> ${fullName}`,
        `🏢 <b>Project:</b> Smart-Stock Inventory`,
        '━━━━━━━━━━━━━━━━━━',
        '',
        'Select an administrative task from the menu below:'
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

module.exports = { registerStartCommand, getStartKeyboard };
