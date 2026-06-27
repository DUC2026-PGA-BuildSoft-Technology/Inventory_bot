const productService = require('../../services/productService');
const { formatProductLine } = require('../../bot/helpers');

const showCatalog = async (ctx, editMode = false) => {
  const products = await productService.listCatalogProducts();

  if (products.length === 0) {
    const emptyMsg = 'Catalog is empty. Add products to the products table first.';
    if (editMode) {
      await ctx.editMessageText(emptyMsg);
    } else {
      await ctx.reply(emptyMsg);
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
  keyboard.push([{ text: '📋 View Current Sale', callback_data: 'sales_list_view' }]);
  keyboard.push([{ text: '📋 Main Menu', callback_data: 'menu_view' }]);

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
