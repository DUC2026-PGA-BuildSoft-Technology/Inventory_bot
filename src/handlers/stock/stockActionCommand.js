const productService = require('../../services/productService');
const { formatMoney } = require('../../bot/helpers');

const registerStockAction = (bot) => {
  bot.action(/^stock:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      const product = await productService.findProductByBarcode(barcode);

      if (!product) {
        await ctx.answerCbQuery('Product not found');
        return;
      }

      await ctx.answerCbQuery(`${product.product_name}: ${product.stock_quantity} in stock`);
      await ctx.reply(
        [
          `Product: ${product.product_name}`,
          `Barcode: ${product.barcode}`,
          `Stock: ${product.stock_quantity}`,
          `Price: ${formatMoney(product.price)}`,
          `Status: ${product.status}`,
        ].join('\n')
      );
    } catch (err) {
      console.error('Error in stock action:', err);
      await ctx.answerCbQuery('Could not load product');
    }
  });
};

module.exports = { registerStockAction };
