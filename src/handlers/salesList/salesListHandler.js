const salesListService = require('../../services/salesListService');
const userService = require('../../services/userService');
const { formatMoney } = require('../../bot/helpers');

const registerSalesListHandler = (bot) => {
  // Command fallback: view sales list
  bot.command('view_sales_list', async (ctx) => {
    try {
      await showSalesList(ctx);
    } catch (err) {
      console.error('Error in /view_sales_list:', err);
      await ctx.reply('Could not load current sales list. Please try again.');
    }
  });

  // Action: view sales list
  bot.action('sales_list_view', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await showSalesList(ctx, true);
    } catch (err) {
      console.error('Error in action sales_list_view:', err);
      await ctx.answerCbQuery('Error loading sales list');
    }
  });

  // Action: clear sales list
  bot.action('sales_list_clear', async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      salesListService.clearSalesList(telegramId);

      await ctx.answerCbQuery('Current sales list cleared');
      
      const text = '📋 Current sales transaction list has been cleared.';
      const keyboard = [
        [
          { text: '📖 Back to Catalog', callback_data: 'catalog_view' },
          { text: '📋 Main Menu', callback_data: 'menu_view' },
        ],
      ];

      await ctx.editMessageText(text, {
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (err) {
      console.error('Error in action sales_list_clear:', err);
      await ctx.answerCbQuery('Error clearing list');
    }
  });

  // Action: confirm sale and checkout
  bot.action('sales_list_confirm', async (ctx) => {
    try {
      const telegramId = ctx.from.id;
      const { user } = await userService.findOrCreateUserByTelegram(ctx);

      if (!user) {
        await ctx.answerCbQuery('User registration error');
        await ctx.reply('Unable to authenticate user session. Please try again.');
        return;
      }

      // Record transaction results
      const result = await salesListService.confirmCheckout(telegramId, user.id);

      if (!result.success) {
        await ctx.answerCbQuery('Checkout failed');
        let failText = '❌ <b>Sales Checkout Failed</b>\n\n';
        
        if (result.reason === 'empty_list') {
          failText += 'Your sales transaction list is empty.';
        } else {
          failText += 'One or more items do not have sufficient stock:\n\n';
          result.results.forEach((item) => {
            if (item.status !== 'sold') {
              failText += `• <b>${item.product.product_name}</b>: Available stock: ${item.availableStock}, requested: ${item.quantity}\n`;
            }
          });
        }

        const keyboard = [
          [
            { text: '📋 Edit Sales List', callback_data: 'sales_list_view' },
            { text: '📖 Back to Catalog', callback_data: 'catalog_view' },
          ],
        ];

        await ctx.reply(failText, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboard },
        });
        return;
      }

      await ctx.answerCbQuery('Sale recorded successfully!');

      // Compile receipt details
      let receiptText = [
        '🧾 <b>Sales Checkout Receipt</b>',
        '',
        '<b>Status:</b> Transaction Recorded Successfully ✅',
        '',
        '<b>Items Sold:</b>',
      ];

      result.results.forEach((item) => {
        receiptText.push(`• <b>${item.product.product_name}</b> x${item.quantity} - Recorded (${formatMoney(item.totalPrice)})`);
      });

      receiptText.push('', `<b>Total Sales Value:</b> ${formatMoney(result.totalProcessedAmount)}`, '', 'Database stock balances have been updated.');

      const keyboard = [
        [
          { text: '📖 Back to Catalog', callback_data: 'catalog_view' },
          { text: '📋 Main Menu', callback_data: 'menu_view' },
        ],
      ];

      // Send the receipt as a new message
      await ctx.reply(receiptText.join('\n'), {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (err) {
      console.error('Error in action sales_list_confirm:', err);
      await ctx.answerCbQuery('Error confirming checkout');
      await ctx.reply('An error occurred during database checkout. Please try again.');
    }
  });
};

/**
 * Helper to display the current sales list
 */
const showSalesList = async (ctx, editMode = false) => {
  const telegramId = ctx.from.id;
  const { items, totalAmount, totalItems } = await salesListService.getSalesList(telegramId);

  let text = '📋 <b>Current Sales Transaction List</b>\n\n';
  const keyboard = [];

  if (items.length === 0) {
    text += 'Your sales list is currently empty. Browse the product catalog to add items.';
    keyboard.push([{ text: '📖 Back to Catalog', callback_data: 'catalog_view' }]);
    keyboard.push([{ text: '📋 Main Menu', callback_data: 'menu_view' }]);
  } else {
    items.forEach((item, index) => {
      text += `${index + 1}. <b>${item.product.product_name}</b> (Barcode: <code>${item.product.barcode}</code>)\n`;
      text += `   Qty: ${item.quantity} | Price: ${formatMoney(item.product.price)} | Subtotal: ${formatMoney(item.subtotal)}\n\n`;
    });

    text += `<b>Total Items:</b> ${totalItems}\n`;
    text += `<b>Total Transaction Value:</b> ${formatMoney(totalAmount)}`;

    keyboard.push([{ text: '✅ Confirm Sale / Checkout', callback_data: 'sales_list_confirm' }]);
    keyboard.push([{ text: '🗑️ Clear List', callback_data: 'sales_list_clear' }]);
    keyboard.push([
      { text: '📖 Back to Catalog', callback_data: 'catalog_view' },
      { text: '📋 Main Menu', callback_data: 'menu_view' },
    ]);
  }

  if (editMode) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (e) {
      // If previous message was a photo details card, delete it and send a new text sales list
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }
};

module.exports = {
  registerSalesListHandler,
};
