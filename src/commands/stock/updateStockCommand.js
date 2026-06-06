const productModel = require('../../models/productModel');
const { parseCommandArgs, ensureCurrentUser } = require('../../bot/helpers');

const registerUpdateStockCommand = (bot) => {
  bot.command('update_stock', async (ctx) => {
    try {
      const [barcode, qtyText] = parseCommandArgs(ctx);
      const quantity = Number.parseInt(qtyText, 10);

      if (!barcode || Number.isNaN(quantity) || quantity === 0) {
        await ctx.reply('Usage: /update_stock [barcode] [qty]\nExample: /update_stock 885001 10');
        return;
      }

      const user = await ensureCurrentUser(ctx);
      const result = await productModel.updateStockByBarcode(barcode, quantity, user.id);

      if (result.status === 'not_found') {
        await ctx.reply(`No product found with barcode ${barcode}.`);
        return;
      }

      if (result.status === 'insufficient_stock') {
        await ctx.reply(
          `Cannot reduce ${result.product.product_name} below zero. Current stock: ${result.product.stock_quantity}`
        );
        return;
      }

      const product = result.product;

      await ctx.reply(
        [
          'Stock updated successfully.',
          `Product: ${product.product_name}`,
          `Barcode: ${product.barcode}`,
          `Change: ${quantity > 0 ? '+' : ''}${quantity}`,
          `New stock: ${product.stock_quantity}`,
          `Status: ${product.status}`,
        ].join('\n')
      );
    } catch (err) {
      console.error('Error in /update_stock:', err);
      await ctx.reply('Could not update stock. Please check the quantity and try again.');
    }
  });
};

module.exports = { registerUpdateStockCommand };
