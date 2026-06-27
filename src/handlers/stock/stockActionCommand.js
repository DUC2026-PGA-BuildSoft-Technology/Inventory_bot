const productService = require('../../services/productService');
const salesListService = require('../../services/salesListService');
const stockService = require('../../services/stockService');
const userService = require('../../services/userService');
const { formatMoney } = require('../../bot/helpers');

// Active custom adjustments sessions: telegramId -> barcode
const customAdjustState = {};

// Session mapping for product edits: telegramId -> { barcode, field }
const productEditState = {};

/**
 * Show product details with dynamic inline action buttons and photo support
 */
const showProductDetails = async (ctx, barcode, editMode = false) => {
  const telegramId = ctx.from.id;
  const product = await productService.findProductByBarcode(barcode);

  if (!product) {
    if (editMode) {
      await ctx.editMessageText('Product not found.');
    } else {
      await ctx.reply('Product not found.');
    }
    return;
  }

  const quantityInList = salesListService.getQuantityInSalesList(telegramId, barcode);
  const user = await userService.findOrCreateUserByTelegram(ctx).then(res => res.user).catch(() => null);
  const userRole = user ? user.role : 'staff';

  const text = [
    '🔎 <b>Product Details</b>',
    '',
    `<b>Product:</b> ${product.product_name}`,
    `<b>Barcode:</b> <code>${product.barcode}</code>`,
    `<b>Category:</b> ${product.category || '-'}`,
    `<b>Color/Size:</b> ${[product.color, product.size].filter(Boolean).join(' / ') || '-'}`,
    `<b>Price:</b> ${formatMoney(product.price)}`,
    `<b>Available Stock:</b> ${product.stock_quantity}`,
    '',
    `📦 <b>In Current Sale List:</b> <code>${quantityInList}</code> units`,
  ].join('\n');

  const keyboard = [];
  const actionRow = [];

  actionRow.push({ text: '➕ Add to Sale', callback_data: `sale_add:${barcode}` });

  if (quantityInList > 0) {
    actionRow.push({ text: '➖ Remove', callback_data: `sale_sub:${barcode}` });
  }

  keyboard.push(actionRow);
  keyboard.push([{ text: '📋 View Sales List', callback_data: 'sales_list_view' }]);
  
  // Render management options if authorized
  if (userRole === 'manager' || userRole === 'admin' || userRole === 'owner') {
    keyboard.push([{ text: '🔧 Adjust Stock (Intake/Outtake)', callback_data: `adjust_menu:${barcode}` }]);
    keyboard.push([
      { text: '✏️ Edit Product', callback_data: `edit_menu:${barcode}` },
      { text: '❌ Delete Product', callback_data: `delete_confirm:${barcode}` }
    ]);
  }
  
  keyboard.push([{ text: '🔙 Back to Catalog', callback_data: 'catalog_view' }]);

  if (product.image_url && product.image_url.trim() !== '') {
    if (editMode) {
      // Delete text message to prevent message type collision
      await ctx.deleteMessage().catch(() => {});
    }
    await ctx.replyWithPhoto(product.image_url, {
      caption: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } else {
    if (editMode) {
      try {
        await ctx.editMessageText(text, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      } catch (e) {
        // If the edit failed because the previous message was a photo type, delete it and send fresh text
        await ctx.deleteMessage().catch(() => {});
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: keyboard,
          },
        });
      }
    } else {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  }
};

/**
 * Show Stock Adjustment Menu (Stock In / Stock Out)
 */
const showStockAdjustmentMenu = async (ctx, barcode, editMode = false) => {
  const product = await productService.findProductByBarcode(barcode);

  if (!product) {
    if (editMode) {
      await ctx.editMessageText('Product not found.');
    } else {
      await ctx.reply('Product not found.');
    }
    return;
  }

  const text = [
    '🔧 <b>Stock Adjustment Menu</b>',
    '',
    `<b>Product:</b> ${product.product_name}`,
    `<b>Barcode:</b> <code>${product.barcode}</code>`,
    `<b>Current Stock Balance:</b> <code>${product.stock_quantity}</code> units`,
    '',
    'Select an adjustment level below to update inventory:',
  ].join('\n');

  const keyboard = [
    [
      { text: '➕ Add 1', callback_data: `adj_add:1:${barcode}` },
      { text: '➕ Add 5', callback_data: `adj_add:5:${barcode}` },
      { text: '➕ Add 10', callback_data: `adj_add:10:${barcode}` },
    ],
    [
      { text: '➖ Sub 1', callback_data: `adj_sub:1:${barcode}` },
      { text: '➖ Sub 5', callback_data: `adj_sub:5:${barcode}` },
      { text: '➖ Sub 10', callback_data: `adj_sub:10:${barcode}` },
    ],
    [
      { text: '✏️ Enter Custom Amount', callback_data: `adj_custom:${barcode}` }
    ],
    [
      { text: '🔙 Back to Product Details', callback_data: `stock:${barcode}` }
    ]
  ];

  // Delete potential photo details card to render adjustment text
  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
};

/**
 * Show Edit Product Menu fields selection
 */
const showEditProductMenu = async (ctx, barcode) => {
  const product = await productService.findProductByBarcode(barcode);
  if (!product) {
    await ctx.reply('Product not found.');
    return;
  }

  const text = [
    '✏️ <b>Edit Product Options</b>',
    '',
    `<b>Product Name:</b> ${product.product_name}`,
    `<b>Price:</b> ${formatMoney(product.price)}`,
    `<b>Category:</b> ${product.category || '-'}`,
    `<b>Color:</b> ${product.color || '-'}`,
    `<b>Size:</b> ${product.size || '-'}`,
    `<b>Image URL:</b> ${product.image_url ? 'Provided' : '-'}`,
    '',
    'Select a field below to edit:',
  ].join('\n');

  const keyboard = [
    [
      { text: '🏷️ Name', callback_data: `edit_field:product_name:${barcode}` },
      { text: '💰 Price', callback_data: `edit_field:price:${barcode}` }
    ],
    [
      { text: '📁 Category', callback_data: `edit_field:category:${barcode}` },
      { text: '🎨 Color', callback_data: `edit_field:color:${barcode}` }
    ],
    [
      { text: '📏 Size', callback_data: `edit_field:size:${barcode}` },
      { text: '🖼️ Image URL', callback_data: `edit_field:image_url:${barcode}` }
    ],
    [
      { text: '🔙 Back to Details', callback_data: `stock:${barcode}` }
    ]
  ];

  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard },
  });
};

/**
 * Show Delete Product confirmation
 */
const showDeleteConfirm = async (ctx, barcode) => {
  const product = await productService.findProductByBarcode(barcode);
  if (!product) {
    await ctx.reply('Product not found.');
    return;
  }

  const text = [
    '⚠️ <b>Confirm Product Deletion</b>',
    '',
    `Are you sure you want to permanently delete <b>${product.product_name}</b>?`,
    'This action cannot be undone and will delete all associated logs.',
  ].join('\n');

  const keyboard = [
    [
      { text: '👍 Yes, Delete', callback_data: `delete_exec:${barcode}` },
      { text: '👎 Cancel', callback_data: `stock:${barcode}` }
    ]
  ];

  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: keyboard }
  });
};

/**
 * Conversational text parser for entering custom quantities
 */
const handleCustomAdjustmentText = async (ctx) => {
  if (!ctx.message || !ctx.message.text) return false;
  const telegramId = ctx.from.id;
  const barcode = customAdjustState[telegramId];
  if (!barcode) return false;

  const text = ctx.message.text.trim();

  // Cancel action
  if (text === '/cancel') {
    delete customAdjustState[telegramId];
    await ctx.reply('❌ Stock adjustment cancelled.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
          [{ text: '📋 Main Menu', callback_data: 'menu_view' }],
        ],
      },
    });
    return true;
  }

  const amount = parseInt(text, 10);
  if (isNaN(amount) || amount === 0) {
    await ctx.reply('⚠️ Invalid input. Please enter a valid number (e.g., 15 to restock, -7 to reduce), or type /cancel to abort.');
    return true;
  }

  try {
    const product = await productService.findProductByBarcode(barcode);
    if (!product) {
      delete customAdjustState[telegramId];
      await ctx.reply('❌ Product not found.');
      return true;
    }

    const { user } = await userService.findOrCreateUserByTelegram(ctx);
    if (!user) {
      await ctx.reply('User profile error.');
      return true;
    }

    // Limit check
    if (amount < 0 && product.stock_quantity < Math.abs(amount)) {
      await ctx.reply(`⚠️ Cannot reduce stock below zero! Current stock is only <code>${product.stock_quantity}</code>. Please enter a valid number or type /cancel to abort.`, {
        parse_mode: 'HTML',
      });
      return true;
    }

    // Database save
    await stockService.updateStock(barcode, amount, user.id);
    delete customAdjustState[telegramId];

    const changeSymbol = amount > 0 ? `+${amount}` : `${amount}`;
    await ctx.reply(`✅ <b>Stock adjusted successfully!</b>\n\n<b>Product:</b> ${product.product_name}\n<b>Barcode:</b> <code>${product.barcode}</code>\n<b>Change:</b> <code>${changeSymbol}</code>\n<b>New Stock:</b> <code>${product.stock_quantity + amount}</code>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔧 Back to Adjust Menu', callback_data: `adjust_menu:${barcode}` }],
          [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
        ],
      },
    });

  } catch (err) {
    console.error('Error in custom stock adjustment text handler:', err);
    await ctx.reply('An error occurred while updating stock. Please try again.');
  }

  return true;
};

/**
 * Conversational text parser for editing product fields
 */
const handleProductEditFieldText = async (ctx) => {
  if (!ctx.message) return false;
  const telegramId = ctx.from.id;
  const editSession = productEditState[telegramId];
  if (!editSession) return false;

  const { barcode, field } = editSession;

  // Handle direct photo uploads for the image_url field
  if (ctx.message.photo) {
    if (field !== 'image_url') {
      await ctx.reply(`⚠️ This field only accepts text inputs. Please type the text value for ${field.replace('_', ' ').toUpperCase()} or send /cancel to abort.`);
      return true;
    }

    try {
      const photo = ctx.message.photo;
      // Get the highest resolution file_id
      const fileId = photo[photo.length - 1].file_id;

      const updated = await productService.updateProductField(barcode, 'image_url', fileId);
      delete productEditState[telegramId];

      if (!updated) {
        await ctx.reply('❌ Error: Product not found.');
        return true;
      }

      await ctx.reply('✅ <b>Product image updated successfully!</b>\n\nYou uploaded a photo directly, which has been linked to this product.', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Back to Edit Menu', callback_data: `edit_menu:${barcode}` }],
            [{ text: '📖 View Catalog', callback_data: 'catalog_view' }]
          ]
        }
      });
    } catch (err) {
      console.error('Error in handleProductEditFieldText photo upload:', err);
      await ctx.reply('An error occurred while uploading the photo. Please try again.');
    }
    return true;
  }

  // Handle text inputs
  if (!ctx.message.text) return false;
  const text = ctx.message.text.trim();

  if (text === '/cancel') {
    delete productEditState[telegramId];
    await ctx.reply('❌ Editing cancelled.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔧 Back to Edit Menu', callback_data: `edit_menu:${barcode}` }],
          [{ text: '📖 View Catalog', callback_data: 'catalog_view' }]
        ]
      }
    });
    return true;
  }

  let val = text;
  if (field === 'price') {
    const numPrice = parseFloat(text);
    if (isNaN(numPrice) || numPrice < 0) {
      await ctx.reply('⚠️ Invalid price value. Please enter a valid decimal number (e.g. 9.99), or type /cancel to abort.');
      return true;
    }
    val = numPrice;
  }

  try {
    const updated = await productService.updateProductField(barcode, field, val);
    delete productEditState[telegramId];

    if (!updated) {
      await ctx.reply('❌ Error: Product not found.');
      return true;
    }

    const fieldLabel = field.replace('_', ' ').toUpperCase();
    await ctx.reply(`✅ <b>Product updated successfully!</b>\n\n<b>Field:</b> ${fieldLabel}\n<b>New Value:</b> ${val}`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Edit Menu', callback_data: `edit_menu:${barcode}` }],
          [{ text: '📖 View Catalog', callback_data: 'catalog_view' }]
        ]
      }
    });

  } catch (err) {
    console.error('Error in handleProductEditFieldText:', err);
    await ctx.reply('An error occurred during updating product. Please try again.');
  }

  return true;
};

const registerStockAction = (bot) => {
  // Action: Open product detail screen
  bot.action(/^stock:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      await ctx.answerCbQuery();
      await showProductDetails(ctx, barcode, true);
    } catch (err) {
      console.error('Error in stock callback:', err);
      await ctx.answerCbQuery('Could not load details');
    }
  });

  // Action: Add item to sales list
  bot.action(/^sale_add:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      const telegramId = ctx.from.id;

      const product = await productService.findProductByBarcode(barcode);
      if (!product) {
        await ctx.answerCbQuery('Product not found');
        return;
      }

      const currentInList = salesListService.getQuantityInSalesList(telegramId, barcode);
      if (currentInList >= product.stock_quantity) {
        await ctx.answerCbQuery('Cannot add: Exceeds available stock');
        return;
      }

      salesListService.addToSalesList(telegramId, barcode);
      await ctx.answerCbQuery('Added 1 unit to sales list');
      await showProductDetails(ctx, barcode, true);
    } catch (err) {
      console.error('Error in sale_add callback:', err);
      await ctx.answerCbQuery('Error updating list');
    }
  });

  // Action: Remove item from sales list
  bot.action(/^sale_sub:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      const telegramId = ctx.from.id;

      salesListService.removeFromSalesList(telegramId, barcode);
      await ctx.answerCbQuery('Removed 1 unit from sales list');
      await showProductDetails(ctx, barcode, true);
    } catch (err) {
      console.error('Error in sale_sub callback:', err);
      await ctx.answerCbQuery('Error updating list');
    }
  });

  // Action: Open Stock Adjustment Menu
  bot.action(/^adjust_menu:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      await ctx.answerCbQuery();
      await showStockAdjustmentMenu(ctx, barcode, true);
    } catch (err) {
      console.error('Error in adjust_menu callback:', err);
      await ctx.answerCbQuery('Could not load adjustment menu');
    }
  });

  // Action: Add Stock (Stock In)
  bot.action(/^adj_add:(\d+):(.+)$/, async (ctx) => {
    try {
      const amount = parseInt(ctx.match[1], 10);
      const barcode = ctx.match[2];

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user) {
        await ctx.answerCbQuery('User registration error');
        return;
      }

      // Update database stock using stockService
      await stockService.updateStock(barcode, amount, user.id);

      await ctx.answerCbQuery(`Restocked: +${amount} units`);
      await showStockAdjustmentMenu(ctx, barcode, true);
    } catch (err) {
      console.error('Error in adj_add callback:', err);
      await ctx.answerCbQuery('Error adjusting stock');
    }
  });

  // Action: Subtract Stock (Stock Out / Write-offs)
  bot.action(/^adj_sub:(\d+):(.+)$/, async (ctx) => {
    try {
      const amount = parseInt(ctx.match[1], 10);
      const barcode = ctx.match[2];

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user) {
        await ctx.answerCbQuery('User registration error');
        return;
      }

      const product = await productService.findProductByBarcode(barcode);
      if (!product) {
        await ctx.answerCbQuery('Product not found');
        return;
      }

      // Boundary check: cannot drop stock below zero
      if (product.stock_quantity < amount) {
        await ctx.answerCbQuery(`Cannot reduce stock below zero! Current stock: ${product.stock_quantity}`, { show_alert: true });
        return;
      }

      // Update database stock using stockService
      await stockService.updateStock(barcode, -amount, user.id);

      await ctx.answerCbQuery(`Reduced: -${amount} units`);
      await showStockAdjustmentMenu(ctx, barcode, true);
    } catch (err) {
      console.error('Error in adj_sub callback:', err);
      await ctx.answerCbQuery('Error adjusting stock');
    }
  });

  // Action: Custom Stock Adjustment
  bot.action(/^adj_custom:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      const telegramId = ctx.from.id;

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user) {
        await ctx.answerCbQuery('User registration error');
        return;
      }

      // Check role permissions
      if (user.role !== 'manager' && user.role !== 'admin' && user.role !== 'owner') {
        await ctx.answerCbQuery('Access Denied: Stock Manager permissions required.', { show_alert: true });
        return;
      }

      customAdjustState[telegramId] = barcode;
      await ctx.answerCbQuery();
      
      const product = await productService.findProductByBarcode(barcode);
      const promptText = [
        '✏️ <b>Custom Stock Adjustment</b>',
        '',
        `<b>Product:</b> ${product.product_name}`,
        `<b>Barcode:</b> <code>${product.barcode}</code>`,
        `<b>Current Stock:</b> <code>${product.stock_quantity}</code> units`,
        '',
        'Please type the exact number to adjust (e.g., <code>12</code> to restock, <code>-7</code> to reduce) and press send.',
        '',
        '<i>Type /cancel to abort.</i>'
      ].join('\n');

      await ctx.editMessageText(promptText, {
        parse_mode: 'HTML',
      });

    } catch (err) {
      console.error('Error in adj_custom callback:', err);
      await ctx.answerCbQuery('Error loading custom prompt');
    }
  });

  // Action: Open Edit Product Menu
  bot.action(/^edit_menu:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      await ctx.answerCbQuery();
      await showEditProductMenu(ctx, barcode);
    } catch (err) {
      console.error('Error in edit_menu action:', err);
      await ctx.answerCbQuery('Error loading edit menu');
    }
  });

  // Action: Edit Product Field
  bot.action(/^edit_field:(.+):(.+)$/, async (ctx) => {
    try {
      const field = ctx.match[1];
      const barcode = ctx.match[2];
      const telegramId = ctx.from.id;

      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'manager' && user.role !== 'admin' && user.role !== 'owner')) {
        await ctx.answerCbQuery('Access Denied: Admin permissions required.', { show_alert: true });
        return;
      }

      const product = await productService.findProductByBarcode(barcode);
      if (!product) {
        await ctx.answerCbQuery('Product not found');
        return;
      }

      productEditState[telegramId] = { barcode, field };
      await ctx.answerCbQuery();

      let currentVal = product[field];
      if (field === 'price') {
        currentVal = formatMoney(currentVal);
      } else if (!currentVal) {
        currentVal = '-';
      }

      const label = field.replace('_', ' ').toUpperCase();
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(`✏️ <b>Edit Product ${label}</b>\n\n<b>Current value:</b> <code>${currentVal}</code>\n\nPlease type the new value for product <b>${label}</b> and send it.\n\n<i>Type /cancel to abort.</i>`, {
        parse_mode: 'HTML'
      });
    } catch (err) {
      console.error('Error in edit_field action:', err);
      await ctx.answerCbQuery('Error starting edit');
    }
  });

  // Action: Open Delete Confirmation Menu
  bot.action(/^delete_confirm:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      await ctx.answerCbQuery();
      await showDeleteConfirm(ctx, barcode);
    } catch (err) {
      console.error('Error in delete_confirm action:', err);
      await ctx.answerCbQuery('Error loading confirmation');
    }
  });

  // Action: Execute Product Deletion
  bot.action(/^delete_exec:(.+)$/, async (ctx) => {
    try {
      const barcode = ctx.match[1];
      const deleted = await productService.deleteProduct(barcode);
      
      if (deleted) {
        await ctx.answerCbQuery('Product deleted successfully', { show_alert: true });
        // Return back to catalog
        const { showCatalog } = require('../catalog/catalogCommand');
        await ctx.deleteMessage().catch(() => {});
        await showCatalog(ctx);
      } else {
        await ctx.answerCbQuery('Product not found');
      }
    } catch (err) {
      console.error('Error in delete_exec action:', err);
      await ctx.answerCbQuery('Error executing delete');
    }
  });
};

module.exports = {
  registerStockAction,
  showProductDetails,
  showStockAdjustmentMenu,
  handleCustomAdjustmentText,
  handleProductEditFieldText,
};
