const { Telegraf } = require('telegraf');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const parseCommandArgs = (ctx) => {
  const text = ctx.message && ctx.message.text ? ctx.message.text : '';
  return text.trim().split(/\s+/).slice(1);
};

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const formatProductLine = (product, index) => {
  const details = [product.category, product.color, product.size].filter(Boolean).join(' / ');
  const detailText = details ? `\n   ${details}` : '';

  return `${index + 1}. ${product.product_name}${detailText}\n   Barcode: ${product.barcode} | Stock: ${product.stock_quantity} | Price: ${formatMoney(product.price)} | Status: ${product.status}`;
};

const ensureCurrentUser = async (ctx) => {
  const telegramId = ctx.from.id;
  let user = await userModel.findUserByTelegramId(telegramId);

  if (!user) {
    user = await userModel.createUser(
      telegramId,
      ctx.from.username || 'Unknown',
      ctx.from.first_name || 'Friend',
      ctx.from.last_name || ''
    );
  }

  return user;
};

// /start command - Register user and send welcome message
bot.start(async (ctx) => {
  try {
    const telegramId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Friend';
    const username = ctx.from.username || 'Unknown';
    const lastName = ctx.from.last_name || '';

    // Check if user exists
    const existingUser = await userModel.findUserByTelegramId(telegramId);

    if (existingUser) {
      // Returning user
      const welcomeBack = `Welcome back ${firstName}! 👋\n\nThank you for using Smart Inventory Stock Bot! We're happy to see you again.`;
      await ctx.reply(welcomeBack);
    } else {
      // New user - save to database
      await userModel.createUser(telegramId, username, firstName, lastName);
      
      // First time welcome
      const firstWelcome = `Welcome ${firstName}! 👋\n\nWelcome to Smart Inventory Stock Bot! Check your stock items and manage inventory easily.`;
      await ctx.reply(firstWelcome);
    }
  } catch (err) {
    console.error('Error in /start:', err);
    await ctx.reply('Error occurred. Try again later.');
  }
});

bot.help(async (ctx) => {
  await ctx.reply(
    [
      'Smart Inventory Stock Bot commands:',
      '',
      '/view_catalog - Show live product catalog from database',
      '/check_stock [barcode] - Check stock for one product',
      '/sell [barcode] [qty] - Record a sale and reduce stock',
      '/update_stock [barcode] [qty] - Add or subtract stock',
      '/start - Register your Telegram account',
      '/help - Show this command menu',
    ].join('\n')
  );
});

bot.command('view_catalog', async (ctx) => {
  try {
    const products = await productModel.listCatalogProducts();

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

bot.action(/^stock:(.+)$/, async (ctx) => {
  try {
    const barcode = ctx.match[1];
    const product = await productModel.findProductByBarcode(barcode);

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

// Start bot
const startBot = async () => {
  try {
    console.log('🤖 Bot starting...');
    bot.launch();
    console.log('✓ Bot is running');
  } catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, startBot };
