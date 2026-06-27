const productService = require('../../services/productService');
const userService = require('../../services/userService');
const { formatMoney } = require('../../bot/helpers');

// In-memory wizard session states
const productCreateState = {};

const handleProductCreateWizard = async (ctx) => {
  if (!ctx.message) return false;
  const telegramId = ctx.from.id;
  const session = productCreateState[telegramId];
  if (!session) return false;

  const text = (ctx.message.text || '').trim();

  // Cancel action
  if (text === '/cancel') {
    delete productCreateState[telegramId];
    await ctx.reply('❌ Product creation cancelled.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
          [{ text: '📋 Main Menu', callback_data: 'menu_view' }],
        ],
      },
    });
    return true;
  }

  const currentStep = session.step;

  try {
    switch (currentStep) {
      case 'barcode': {
        if (!text) {
          await ctx.reply('⚠️ Please enter a valid text barcode (or send /cancel to abort):');
          return true;
        }
        // Check if barcode already exists
        const existingProduct = await productService.findProductByBarcode(text);
        if (existingProduct) {
          await ctx.reply(`⚠️ This barcode already exists for product: <b>${existingProduct.product_name}</b>.\n\nPlease enter a unique barcode or send /cancel to abort:`, { parse_mode: 'HTML' });
          return true;
        }
        session.details.barcode = text;
        session.step = 'product_name';
        await ctx.reply(`✅ Barcode <code>${text}</code> (${text.length} characters) registered.\n\nStep 2/8: Please enter the <b>Product Name</b>:\n\n<i>Type /cancel to abort.</i>`, { parse_mode: 'HTML' });
        break;
      }
      case 'product_name': {
        if (!text) {
          await ctx.reply('⚠️ Please enter a product name (or send /cancel to abort):');
          return true;
        }
        session.details.product_name = text;
        session.step = 'category';
        await ctx.reply('Step 3/8: Please enter the product <b>Category</b> (e.g. Clothing, Electronics):\n\n<i>Type /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'category': {
        if (!text) {
          await ctx.reply('⚠️ Please enter a category (or send /cancel to abort):');
          return true;
        }
        session.details.category = text;
        session.step = 'color';
        await ctx.reply('Step 4/8: Please enter the product <b>Color</b>:\n\n<i>Type /skip to skip, or /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'color': {
        session.details.color = (text === '-' || text === '/skip') ? '' : text;
        session.step = 'size';
        await ctx.reply('Step 5/8: Please enter the product <b>Size</b>:\n\n<i>Type /skip to skip, or /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'size': {
        session.details.size = (text === '-' || text === '/skip') ? '' : text;
        session.step = 'stock_quantity';
        await ctx.reply('Step 6/8: Please enter the initial <b>Stock Quantity</b> (integer >= 0):\n\n<i>Type /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'stock_quantity': {
        const qty = parseInt(text, 10);
        if (isNaN(qty) || qty < 0) {
          await ctx.reply('⚠️ Invalid number. Please enter a valid stock integer >= 0 (or send /cancel to abort):');
          return true;
        }
        session.details.stock_quantity = qty;
        session.step = 'price';
        await ctx.reply('Step 7/8: Please enter the product <b>Price</b> in USD (e.g. 9.99 or 15.00):\n\n<i>Type /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'price': {
        const priceVal = parseFloat(text);
        if (isNaN(priceVal) || priceVal <= 0) {
          await ctx.reply('⚠️ Invalid price. Please enter a positive number for price (or send /cancel to abort):');
          return true;
        }
        session.details.price = priceVal;
        session.step = 'image_url';
        await ctx.reply('Step 8/8: Please upload a <b>Product Image</b> (or paste an image URL):\n\n<i>Type /skip to skip, or /cancel to abort.</i>', { parse_mode: 'HTML' });
        break;
      }
      case 'image_url': {
        let imageUrl = '';
        if (ctx.message.photo) {
          const photo = ctx.message.photo;
          imageUrl = photo[photo.length - 1].file_id;
        } else if (text && text !== '-' && text !== '/skip') {
          imageUrl = text;
        } else {
          imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'; // Default placeholder
        }

        session.details.image_url = imageUrl;

        // Create product
        const newProduct = await productService.createProduct(session.details);
        delete productCreateState[telegramId];

        if (newProduct) {
          const successText = [
            '✅ <b>Product Created Successfully!</b>',
            '',
            `<b>Product Name:</b> ${newProduct.product_name}`,
            `<b>Barcode:</b> ${newProduct.barcode}`,
            `<b>Category:</b> ${newProduct.category}`,
            `<b>Color:</b> ${newProduct.color || '-'}`,
            `<b>Size:</b> ${newProduct.size || '-'}`,
            `<b>Stock Balance:</b> ${newProduct.stock_quantity}`,
            `<b>Price:</b> ${formatMoney(newProduct.price)}`,
          ].join('\n');

          const keyboard = [
            [{ text: '🔎 View Details', callback_data: `stock:${newProduct.barcode}` }],
            [{ text: '📖 View Catalog', callback_data: 'catalog_view' }]
          ];

          await ctx.reply(successText, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: keyboard }
          });
        } else {
          await ctx.reply('❌ Failed to create product. Please try again.');
        }
        break;
      }
    }
  } catch (err) {
    console.error('Error in product create wizard:', err);
    delete productCreateState[telegramId];
    await ctx.reply('❌ An error occurred during product creation. Please try again.');
  }

  return true;
};

const registerProductCreateHandler = (bot) => {
  // Command: /add_product
  bot.command('add_product', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'stock-manager' && user.role !== 'admin')) {
        await ctx.reply('⚠️ Access Denied: Only Store Owners, Managers, and Stock Managers can add new products.');
        return;
      }

      const telegramId = ctx.from.id;
      productCreateState[telegramId] = { step: 'barcode', details: {} };

      await ctx.reply('➕ <b>Add New Product Wizard</b>\n\nStep 1/8: Please type or scan the product <b>Barcode</b>:\n\n<i>Type /cancel to abort.</i>', {
        parse_mode: 'HTML'
      });
    } catch (err) {
      console.error('Error starting /add_product command:', err);
      await ctx.reply('Error starting product creation wizard.');
    }
  });

  // Action callback: product_add_start
  bot.action('product_add_start', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'stock-manager' && user.role !== 'admin')) {
        await ctx.answerCbQuery('Access Denied: Stock Manager permissions required.', { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      const telegramId = ctx.from.id;
      productCreateState[telegramId] = { step: 'barcode', details: {} };

      await ctx.deleteMessage().catch(() => {});
      await ctx.reply('➕ <b>Add New Product Wizard</b>\n\nStep 1/8: Please type or scan the product <b>Barcode</b>:\n\n<i>Type /cancel to abort.</i>', {
        parse_mode: 'HTML'
      });
    } catch (err) {
      console.error('Error in product_add_start action:', err);
      await ctx.answerCbQuery('Error starting product creation');
    }
  });
};

module.exports = {
  registerProductCreateHandler,
  handleProductCreateWizard,
};
