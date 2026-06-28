const userService = require('../../services/userService');
const { showCatalog } = require('../catalog/catalogCommand');

// Shared Reply Keyboard markup definition
const mainReplyKeyboard = {
  keyboard: [
    [{ text: '📋 Main Menu' }, { text: '📖 View Catalog' }],
    [{ text: '⏳ History' }],
    [{ text: '👤 Profile' }]
  ],
  resize_keyboard: true
};

const registerKeyboardHandler = (bot) => {
  // Listen to Main Menu button
  bot.hears(['📋 Main Menu', 'Main Menu'], async (ctx) => {
    try {
      const firstName = ctx.from.first_name || 'Friend';
      const lastName = ctx.from.last_name || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      const role = user ? user.role : 'seller';

      // Import getStartKeyboard dynamically to avoid circular references
      const { getStartKeyboard } = require('../start/startCommand');

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
          inline_keyboard: getStartKeyboard(role)
        }
      });
    } catch (err) {
      console.error('Error in keyboard Main Menu:', err);
      await ctx.reply('Error loading menu.');
    }
  });

  // Listen to View Catalog button
  bot.hears(['📖 View Catalog', 'View Catalog'], async (ctx) => {
    try {
      await showCatalog(ctx, false);
    } catch (err) {
      console.error('Error in keyboard View Catalog:', err);
      await ctx.reply('Could not load catalog.');
    }
  });

  // Listen to Profile button
  bot.hears(['👤 Profile', 'Profile'], async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user) {
        await ctx.reply('User registration not found. Please click /start first.');
        return;
      }

      const regDate = new Date(user.created_at).toLocaleString();
      const profileText = [
        '👤 <b>User Profile Information</b>',
        '---------------------------------------',
        `<b>Name:</b> ${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim(),
        `<b>Username:</b> ${ctx.from.username ? '@' + ctx.from.username : '-'}`,
        `<b>Telegram ID:</b> <code>${ctx.from.id}</code>`,
        `<b>Account Role:</b> <code>${user.role.toUpperCase()}</code>`,
        `<b>Status:</b> <code>${user.status.toUpperCase()}</code>`,
        `<b>Registered On:</b> ${regDate}`,
      ].join('\n');

      await ctx.reply(profileText, { parse_mode: 'HTML' });
    } catch (err) {
      console.error('Error in profile handler:', err);
      await ctx.reply('Error loading profile.');
    }
  });

  // Listen to History button
  bot.hears(['⏳ History', 'History'], async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user) {
        await ctx.reply('User registration not found.');
        return;
      }

      const role = user.role;
      const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      if (role === 'seller') {
        const sales = await userService.getUserSalesHistory(user.id);
        if (sales.length === 0) {
          await ctx.reply('⏳ <b>Your Sales History</b>\n\nYou have not recorded any sales yet.', { parse_mode: 'HTML' });
          return;
        }

        const lines = [
          '⏳ <b>Your Recent Sales History (Last 10)</b>',
          '━━━━━━━━━━━━━━━━━━━━━━━━━',
          ...sales.map((s, idx) => {
            const date = new Date(s.sold_at).toLocaleString();
            const num = emojiNumbers[idx] || `${idx + 1}.`;
            return [
              `${num} <b>🛒 SALE RECORDED</b>`,
              `  🔹 <b>Product:</b> ${s.product_name}`,
              `  🔹 <b>Quantity:</b> ${s.quantity} units`,
              `  🔹 <b>Total Price:</b> $${Number(s.total_price).toFixed(2)}`,
              `  📅 <i>${date}</i>`,
              ''
            ].join('\n');
          })
        ];
        await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });

      } else if (role === 'stock-manager') {
        const logs = await userService.getUserStockHistory(user.id);
        if (logs.length === 0) {
          await ctx.reply('⏳ <b>Your Stock Audit History</b>\n\nYou have not performed any stock adjustments yet.', { parse_mode: 'HTML' });
          return;
        }

        const lines = [
          '⏳ <b>Your Recent Stock Audit History (Last 10)</b>',
          '━━━━━━━━━━━━━━━━━━━━━━━━━',
          ...logs.map((l, idx) => {
            const date = new Date(l.created_at).toLocaleString();
            const num = emojiNumbers[idx] || `${idx + 1}.`;
            const change = l.quantity_changed >= 0 ? `+${l.quantity_changed}` : l.quantity_changed;
            const note = l.note ? ` (${l.note})` : '';
            return [
              `${num} <b>📦 STOCK ADJUSTED</b>`,
              `  🔹 <b>Product:</b> ${l.product_name}`,
              `  🔹 <b>Change:</b> ${change} units`,
              `  🔹 <b>Action:</b> ${l.action_type}${note}`,
              `  📅 <i>${date}</i>`,
              ''
            ].join('\n');
          })
        ];
        await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });

      } else {
        // Owner, Manager, Admin can see global store actions
        const logs = await userService.getGlobalHistory();
        if (logs.length === 0) {
          await ctx.reply('⏳ <b>Store Global Audit History</b>\n\nNo activities registered in the store yet.', { parse_mode: 'HTML' });
          return;
        }

        const lines = [
          '⏳ <b>Store Global Audit History (Last 10)</b>',
          '━━━━━━━━━━━━━━━━━━━━━━━━━',
          ...logs.map((l, idx) => {
            const date = new Date(l.date).toLocaleString();
            const num = emojiNumbers[idx] || `${idx + 1}.`;
            if (l.type === 'sale') {
              return [
                `${num} <b>🛒 SALE RECORDED</b>`,
                `  🔹 <b>Product:</b> ${l.product_name}`,
                `  🔹 <b>Action:</b> Sold ${l.details} units`,
                `  🔹 <b>Done By:</b> ${l.done_by}`,
                `  📅 <i>${date}</i>`,
                ''
              ].join('\n');
            } else {
              return [
                `${num} <b>📦 STOCK ADJUSTED</b>`,
                `  🔹 <b>Product:</b> ${l.product_name}`,
                `  🔹 <b>Action:</b> ${l.details}`,
                `  🔹 <b>Done By:</b> ${l.done_by}`,
                `  📅 <i>${date}</i>`,
                ''
              ].join('\n');
            }
          })
        ];
        await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
      }
    } catch (err) {
      console.error('Error in history handler:', err);
      await ctx.reply('Error loading history logs.');
    }
  });
};

module.exports = {
  registerKeyboardHandler,
  mainReplyKeyboard
};
