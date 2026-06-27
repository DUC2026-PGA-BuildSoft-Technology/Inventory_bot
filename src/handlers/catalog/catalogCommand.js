const productService = require('../../services/productService');
const userService = require('../../services/userService');
const { formatProductLine } = require('../../bot/helpers');

const showCatalog = async (ctx, editMode = false) => {
  const products = await productService.listCatalogProducts();

  const { user } = await userService.findOrCreateUserByTelegram(ctx).catch(() => ({ user: null }));
  const role = user ? user.role : 'seller';

  if (products.length === 0) {
    const emptyMsg = 'Catalog is empty. Add products to the products table first.';
    // If empty but user is authorized, allow adding a product
    const emptyKeyboard = [];
    if (role === 'owner' || role === 'manager' || role === 'stock-manager' || role === 'admin') {
      emptyKeyboard.push([{ text: '➕ Add New Product', callback_data: 'product_add_start' }]);
    }
    emptyKeyboard.push([{ text: '📋 Main Menu', callback_data: 'menu_view' }]);

    if (editMode) {
      await ctx.editMessageText(emptyMsg, { reply_markup: { inline_keyboard: emptyKeyboard } }).catch(() => {});
    } else {
      await ctx.reply(emptyMsg, { reply_markup: { inline_keyboard: emptyKeyboard } }).catch(() => {});
    }
    return;
  }

  const catalogText = [
    '📖 <b>Live Product Catalog</b>',
    `Updated from database: ${new Date().toLocaleString()}`,
    '',
    ...products.map(formatProductLine),
  ].join('\n');

  const keyboard = products.slice(0, 10).map((product) => [
    {
      text: `${product.product_name} (${product.stock_quantity})`,
      callback_data: `stock:${product.barcode}`,
    },
  ]);

  // Navigation shortcuts
  if (role === 'owner' || role === 'manager' || role === 'stock-manager' || role === 'admin') {
    keyboard.push([{ text: '➕ Add New Product', callback_data: 'product_add_start' }]);
  }
  keyboard.push([
    { text: '📋 View Sales', callback_data: 'sales_list_view' },
    { text: '📋 Main Menu', callback_data: 'menu_view' }
  ]);

  if (editMode) {
    try {
      await ctx.editMessageText(catalogText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (e) {
      // If the edit fails (e.g. previous message was a photo details card), delete it and send fresh text
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(catalogText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  } else {
    await ctx.reply(catalogText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
};

const registerCatalogCommand = (bot) => {
  // Command: view catalog
  bot.command('view_catalog', async (ctx) => {
    try {
      await showCatalog(ctx);
    } catch (err) {
      console.error('Error in /view_catalog:', err);
      await ctx.reply('Could not load catalog from database. Please try again later.');
    }
  });

  // Action: catalog view callback
  bot.action('catalog_view', async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await showCatalog(ctx, true);
    } catch (err) {
      console.error('Error in catalog_view action:', err);
      await ctx.answerCbQuery('Error loading catalog');
    }
  });
};

module.exports = { registerCatalogCommand, showCatalog };
