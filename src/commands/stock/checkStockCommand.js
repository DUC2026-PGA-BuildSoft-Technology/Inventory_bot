const productModel = require('../../models/productModel');
const { parseCommandArgs, formatMoney } = require('../../bot/helpers');

const registerCheckStockCommand = (bot) => {
  bot.command('check_stock', async (ctx) => {
    try {
      const [barcode] = parseCommandArgs(ctx);

      if (!barcode) {
        await ctx.reply('Usage: /check_stock [barcode]\nExample: /check_stock 885001');
        return;
      }

      const product = await productModel.findProductByBarcode(barcode);

      if (!product) {
        await ctx.reply(`No product found with barcode ${barcode}.`);
        return;
      }

      await ctx.reply(
        [
          `Product: ${product.product_name}`,
          `Barcode: ${product.barcode}`,
          `Category: ${product.category || '-'}`,
          `Color/Size: ${[product.color, product.size].filter(Boolean).join(' / ') || '-'}`,
          `Stock: ${product.stock_quantity}`,
          `Price: ${formatMoney(product.price)}`,
          `Status: ${product.status}`,
        ].join('\n')
      );
    } catch (err) {
      console.error('Error in /check_stock:', err);
      await ctx.reply('Could not check stock. Please try again later.');
    }
  });
};

module.exports = { registerCheckStockCommand };
