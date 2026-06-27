const salesService = require('../../services/salesService');
const userService = require('../../services/userService');
const { formatMoney } = require('../../bot/helpers');

const showReportsDashboard = async (ctx, editMode = false) => {
  const text = [
    '📊 <b>Reports Dashboard</b>',
    '',
    'Select a report category and timeframe below to audit sales and stock changes:',
  ].join('\n');

  const keyboard = [
    [
      { text: '🛒 Sales: Daily', callback_data: 'report_sales:daily' },
      { text: '🛒 Sales: Weekly', callback_data: 'report_sales:weekly' },
      { text: '🛒 Sales: Monthly', callback_data: 'report_sales:monthly' }
    ],
    [
      { text: '📦 Stock: Daily', callback_data: 'report_stock:daily' },
      { text: '📦 Stock: Weekly', callback_data: 'report_stock:weekly' },
      { text: '📦 Stock: Monthly', callback_data: 'report_stock:monthly' }
    ],
    [
      { text: '📋 Main Menu', callback_data: 'menu_view' }
    ]
  ];

  if (editMode) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (e) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } else {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

const showSalesReport = async (ctx, timeframe) => {
  const report = await salesService.getSalesReport(timeframe);
  const titleMap = {
    daily: 'Daily',
    weekly: 'Weekly (Last 7 Days)',
    monthly: 'Monthly (Last 30 Days)'
  };
  const title = titleMap[timeframe] || timeframe;

  const text = [
    `🛒 <b>Sales Report (${title})</b>`,
    `📅 <b>Date:</b> ${new Date().toLocaleDateString()}`,
    '━━━━━━━━━━━━━━━━━━',
    '',
    '🛍️ <b>Summary of Items Sold</b>',
  ];

  if (report.items.length === 0) {
    text.push('  <i>(No sales recorded during this period)</i>');
  } else {
    report.items.forEach((item) => {
      text.push(`🔹 <b>${item.product_name}</b> (${item.category || '-'})`);
      text.push(`   <i>└ x${item.total_qty} sold | Revenue: ${formatMoney(item.total_amount)}</i>`);
    });
  }

  text.push(
    '━━━━━━━━━━━━━━━━━━',
    `💰 <b>Grand Total Revenue:</b> <code>${formatMoney(report.grandTotal)}</code>`
  );

  const keyboard = [
    [
      { text: '🔙 Back', callback_data: 'reports_dashboard_view' },
      { text: '📋 Main Menu', callback_data: 'menu_view' }
    ]
  ];

  try {
    await ctx.editMessageText(text.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (e) {
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(text.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

const showStockReport = async (ctx, timeframe) => {
  const stockService = require('../../services/stockService');
  const report = await stockService.getStockMovementReport(timeframe);
  const titleMap = {
    daily: 'Daily',
    weekly: 'Weekly (Last 7 Days)',
    monthly: 'Monthly (Last 30 Days)'
  };
  const title = titleMap[timeframe] || timeframe;

  const { logs, lowStock, deletions } = report;

  const text = [
    `📦 <b>Stock Audit Report (${title})</b>`,
    `📅 <b>Date:</b> ${new Date().toLocaleDateString()}`,
    '━━━━━━━━━━━━━━━━━━',
    '',
  ];

  // 1. Stock Additions (add)
  const additions = logs.filter(l => l.action_type === 'stock_in' || l.action_type === 'restock');
  text.push('📥 <b>Stock Intake (Add Stock)</b>');
  if (additions.length === 0) {
    text.push('  <i>(No stock intake logged)</i>');
  } else {
    additions.forEach(l => {
      text.push(`🔹 <b>${l.product_name}</b>: +${l.quantity_changed} units`);
      text.push(`   <i>└ Note: ${l.note || 'Restocked'}</i>`);
    });
  }
  text.push('');

  // 2. Stock Outflows (out)
  const deductions = logs.filter(l => l.action_type === 'stock_out' || l.action_type === 'sale');
  text.push('📤 <b>Stock Outflow (Sales/Deductions)</b>');
  if (deductions.length === 0) {
    text.push('  <i>(No stock outflow logged)</i>');
  } else {
    deductions.forEach(l => {
      const qty = Math.abs(l.quantity_changed);
      text.push(`🔹 <b>${l.product_name}</b>: -${qty} units`);
      text.push(`   <i>└ Note: ${l.note || 'Sold/Cleared'}</i>`);
    });
  }
  text.push('');

  // 3. New Products Registered (add new product)
  const newProducts = logs.filter(l => l.action_type === 'add_product');
  text.push('🆕 <b>New Products Registered</b>');
  if (newProducts.length === 0) {
    text.push('  <i>(No new products registered)</i>');
  } else {
    newProducts.forEach(l => {
      text.push(`🔹 <b>${l.product_name}</b>`);
      text.push(`   <i>└ Initial stock: ${l.quantity_changed} units</i>`);
    });
  }
  text.push('');

  // 4. Product Profile Updates (update product)
  const updates = logs.filter(l => l.action_type === 'update_product');
  text.push('⚙️ <b>Specification Updates</b>');
  if (updates.length === 0) {
    text.push('  <i>(No updates logged)</i>');
  } else {
    updates.forEach(l => {
      text.push(`🔹 <b>${l.product_name}</b>`);
      text.push(`   <i>└ ${l.note}</i>`);
    });
  }
  text.push('');

  // 5. Deleted Products Archive (delete product)
  text.push('🗑️ <b>Deleted Products</b>');
  if (deletions.length === 0) {
    text.push('  <i>(No products deleted)</i>');
  } else {
    deletions.forEach(d => {
      text.push(`🔹 <b>${d.product_name}</b>`);
      text.push(`   <i>└ Barcode: ${d.barcode}</i>`);
    });
  }
  text.push('');

  // 6. Low Stock Alerts (low)
  text.push('⚠️ <b>Low Stock Alerts (5 or fewer left)</b>');
  if (lowStock.length === 0) {
    text.push('  <i>(All active products healthy)</i>');
  } else {
    lowStock.forEach(p => {
      text.push(`🔹 <b>${p.product_name}</b>: ${p.stock_quantity} left`);
    });
  }

  const keyboard = [
    [
      { text: '🔙 Back', callback_data: 'reports_dashboard_view' },
      { text: '📋 Main Menu', callback_data: 'menu_view' }
    ]
  ];

  try {
    await ctx.editMessageText(text.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (e) {
    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(text.join('\n'), {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  }
};

const registerOwnerReportCommand = (bot) => {
  // Command: Owner Report (CLI Fallback to Daily)
  bot.command('owner_report', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'admin')) {
        await ctx.reply('⚠️ Access Denied: This command is restricted to the Store Owner and Managers only.');
        return;
      }
      await showReportsDashboard(ctx);
    } catch (err) {
      console.error('Error in /owner_report command:', err);
      await ctx.reply('Error loading reports dashboard.');
    }
  });

  // Action: Open Dashboard Menu
  bot.action('reports_dashboard_view', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'admin')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      await showReportsDashboard(ctx, true);
    } catch (err) {
      console.error('Error in reports_dashboard_view action:', err);
      await ctx.answerCbQuery('Error loading reports dashboard.');
    }
  });

  // Action: Display Sales Report
  bot.action(/^report_sales:(.+)$/, async (ctx) => {
    try {
      const timeframe = ctx.match[1];
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'admin')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      await showSalesReport(ctx, timeframe);
    } catch (err) {
      console.error('Error in report_sales action:', err);
      await ctx.answerCbQuery('Error loading sales report.');
    }
  });

  // Action: Display Stock Report
  bot.action(/^report_stock:(.+)$/, async (ctx) => {
    try {
      const timeframe = ctx.match[1];
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      if (!user || (user.role !== 'owner' && user.role !== 'manager' && user.role !== 'admin')) {
        await ctx.answerCbQuery('Access Denied: Owner/Manager permissions required.', { show_alert: true });
        return;
      }
      await ctx.answerCbQuery();
      await showStockReport(ctx, timeframe);
    } catch (err) {
      console.error('Error in report_stock action:', err);
      await ctx.answerCbQuery('Error loading stock report.');
    }
  });
};

module.exports = { registerOwnerReportCommand };
