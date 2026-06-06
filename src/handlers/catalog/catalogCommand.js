const productService = require('../../services/productService');
const { formatProductLine } = require('../../bot/helpers');

const registerCatalogCommand = (bot) => {
  bot.command('view_catalog', async (ctx) => {
    try {
      const products = await productService.listCatalogProducts();

      if (products.length === 0) {
        await ctx.reply('Catalog is empty. Add products to the products table first.');
        return;
      }

      const catalogText = [
        'Live Product Catalog',
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

      await ctx.reply(catalogText, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (err) {
      console.error('Error in /view_catalog:', err);
      await ctx.reply('Could not load catalog from database. Please try again later.');
    }
  });
};

module.exports = { registerCatalogCommand };
