const productModel = require('../../models/productModel');
const { parseCommandArgs, ensureCurrentUser, formatMoney } = require('../../bot/helpers');

const registerSellCommand = (bot) => {
  bot.command('sell', async (ctx) => {
    try {
      const [barcode, qtyText] = parseCommandArgs(ctx);
      const quantity = Number.parseInt(qtyText, 10);

      if (!barcode || Number.isNaN(quantity) || quantity <= 0) {
        await ctx.reply('Usage: /sell [barcode] [qty]\nExample: /sell 885001 2');
        return;
      }

      const user = await ensureCurrentUser(ctx);
      const result = await productModel.recordSaleByBarcode(barcode, quantity, user.id);

      if (result.status === 'not_found') {
        await ctx.reply(`No product found with barcode ${barcode}.`);
        return;
      }

      if (result.status === 'insufficient_stock') {
        await ctx.reply(
          `Not enough stock for ${result.product.product_name}. Available: ${result.product.stock_quantity}`
        );
        return;
      }

      await ctx.reply(
        [
          'Sale recorded successfully.',
          `Product: ${result.product.product_name}`,
          `Quantity sold: ${result.quantity}`,
          `Total: ${formatMoney(result.totalPrice)}`,
          `Remaining stock: ${result.product.stock_quantity}`,
          `Status: ${result.product.status}`,
        ].join('\n')
      );
    } catch (err) {
      console.error('Error in /sell:', err);
      await ctx.reply('Could not record sale. Please try again later.');
    }
  });
};

module.exports = { registerSellCommand };
