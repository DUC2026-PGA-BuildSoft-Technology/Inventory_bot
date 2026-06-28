const { Telegraf } = require('telegraf');
const userService = require('../services/userService');
const { registerStartCommand } = require('../handlers/start/startCommand');
const { registerHelpCommand } = require('../handlers/help/helpCommand');
const { registerCatalogCommand } = require('../handlers/catalog/catalogCommand');
const { registerCheckStockCommand } = require('../handlers/stock/checkStockCommand');
const { registerUpdateStockCommand } = require('../handlers/stock/updateStockCommand');
const { registerSellCommand } = require('../handlers/sell/sellCommand');
const { registerStockAction } = require('../handlers/stock/stockActionCommand');
const { registerMenuCommand } = require('../handlers/menu/menuCommand');
const { registerExchangeCommand } = require('../handlers/exchange/exchangeCommand');
const { registerSalesListHandler } = require('../handlers/salesList/salesListHandler');
const { registerOwnerReportCommand } = require('../handlers/owner/ownerReportCommand');
const { registerUserManagementHandler } = require('../handlers/users/userManagementHandler');
const { registerProductCreateHandler, handleProductCreateWizard } = require('../handlers/stock/productCreateHandler');
const { handleCustomAdjustmentText, handleProductEditFieldText } = require('../handlers/stock/stockActionCommand');
const { registerKeyboardHandler } = require('../handlers/menu/keyboardHandler');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Global Middleware to Intercept and Block Banned Users
bot.use(async (ctx, next) => {
  try {
    if (ctx.from && ctx.from.id) {
      // Fetch user profile status
      const { user } = await userService.findOrCreateUserByTelegram(ctx).catch(() => ({ user: null }));
      if (user && user.status === 'banned') {
        if (ctx.callbackQuery) {
          await ctx.answerCbQuery('❌ Access Denied: Your account has been banned.', { show_alert: true });
        } else {
          await ctx.reply('❌ Access Denied: Your account has been banned by the administrator.');
        }
        return; // Terminate update flow
      }
    }
  } catch (err) {
    console.error('Error in global ban intercept middleware:', err);
  }
  return next();
});

registerStartCommand(bot);
registerHelpCommand(bot);
registerCatalogCommand(bot);
registerCheckStockCommand(bot);
registerUpdateStockCommand(bot);
registerSellCommand(bot);
registerStockAction(bot);
registerMenuCommand(bot);
registerExchangeCommand(bot);
registerSalesListHandler(bot);
registerOwnerReportCommand(bot);
registerUserManagementHandler(bot);
registerProductCreateHandler(bot);
registerKeyboardHandler(bot);

// Global error handler to prevent Node server crashes (Zero-Crash Requirement)
bot.catch((err, ctx) => {
  console.error(`Telegraf error for update ${ctx.update.update_id}:`, err);
  ctx.reply('⚠️ An unexpected error occurred. Please use the menu buttons to browse items.').catch((e) => {
    console.error('Failed to send error reply:', e);
  });
});

// Unmatched text fallback handler
bot.on('message', async (ctx) => {
  try {
    // Intercept if the user has an active custom stock adjustment session
    const wasHandled = await handleCustomAdjustmentText(ctx);
    if (wasHandled) return;

    // Intercept if the user has an active product editing session
    const wasEditHandled = await handleProductEditFieldText(ctx);
    if (wasEditHandled) return;

    // Intercept if the user has an active product creation session
    const wasCreateHandled = await handleProductCreateWizard(ctx);
    if (wasCreateHandled) return;

    const keyboard = [
      [{ text: '📖 View Catalog', callback_data: 'catalog_view' }],
      [{ text: '📋 View Sale List', callback_data: 'sales_list_view' }],
    ];

    if (ctx.message && ctx.message.text) {
      const text = ctx.message.text;
      if (text.startsWith('/')) {
        await ctx.reply(`⚠️ Unrecognized command: ${text}\n\nUse the buttons below to browse inventory.`, {
          reply_markup: { inline_keyboard: keyboard },
        });
      } else {
        await ctx.reply('⚠️ Sorry, I did not recognize that command. Please use the menu buttons below to manage inventory!', {
          reply_markup: { inline_keyboard: keyboard },
        });
      }
    } else {
      // Handles stickers, photos, documents, etc.
      await ctx.reply('⚠️ Unhandled input type. Please use the menu buttons below to manage inventory.', {
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  } catch (err) {
    console.error('Error in message fallback handler:', err);
  }
});

const startBot = async () => {
  try {
    console.log('🤖 Bot starting...');

    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Open the bot menu' },
      { command: 'menu', description: 'Show available commands' },
      { command: 'help', description: 'Show help information' },
      { command: 'view_catalog', description: 'View the live product catalog' },
      { command: 'view_sales_list', description: 'View current sales transaction list' },
      { command: 'owner_report', description: 'Show daily sales report (Owner/Manager only)' },
      { command: 'manage_users', description: 'Manage user role permissions (Owner/Manager only)' },
      { command: 'check_stock', description: 'Check stock by barcode' },
      { command: 'sell', description: 'Record a sale' },
      { command: 'update_stock', description: 'Adjust inventory stock' },
      { command: 'exchange', description: 'Show USD → KHR exchange rate' },
    ]);

    // Force Telegram to display the blue "Menu" button next to the text input field
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'commands',
      },
    }).catch((err) => {
      console.error('Failed to set chat menu button:', err.message);
    });

    await bot.launch();
    console.log('✓ Bot is running');
  } catch (err) {
    console.error('Error starting bot:', err);
    process.exit(1);
  }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, startBot };
