const { Telegraf } = require('telegraf');
const { registerStartCommand } = require('../commands/start/startCommand');
const { registerHelpCommand } = require('../commands/help/helpCommand');
const { registerCatalogCommand } = require('../commands/catalog/catalogCommand');
const { registerCheckStockCommand } = require('../commands/stock/checkStockCommand');
const { registerUpdateStockCommand } = require('../commands/stock/updateStockCommand');
const { registerSellCommand } = require('../commands/sell/sellCommand');
const { registerStockAction } = require('../commands/actions/stockActionCommand');
const { registerMenuCommand } = require('../commands/menu/menuCommand');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

registerStartCommand(bot);
registerHelpCommand(bot);
registerCatalogCommand(bot);
registerCheckStockCommand(bot);
registerUpdateStockCommand(bot);
registerSellCommand(bot);
registerStockAction(bot);
registerMenuCommand(bot);

const startBot = async () => {
  try {
    console.log('🤖 Bot starting...');

    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Open the bot menu' },
      { command: 'menu', description: 'Show available commands' },
      { command: 'help', description: 'Show help information' },
      { command: 'view_catalog', description: 'View the live product catalog' },
      { command: 'check_stock', description: 'Check stock by barcode' },
      { command: 'sell', description: 'Record a sale' },
      { command: 'update_stock', description: 'Adjust inventory stock' },
    ]);

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
