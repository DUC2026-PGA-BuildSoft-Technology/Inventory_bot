const { Telegraf } = require('telegraf');
const { registerStartCommand } = require('../handlers/start/startCommand');
const { registerHelpCommand } = require('../handlers/help/helpCommand');
const { registerCatalogCommand } = require('../handlers/catalog/catalogCommand');
const { registerCheckStockCommand } = require('../handlers/stock/checkStockCommand');
const { registerUpdateStockCommand } = require('../handlers/stock/updateStockCommand');
const { registerSellCommand } = require('../handlers/sell/sellCommand');
const { registerStockAction } = require('../handlers/stock/stockActionCommand');
const { registerMenuCommand } = require('../handlers/menu/menuCommand');
const { registerExchangeCommand } = require('../handlers/exchange/exchangeCommand');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

registerStartCommand(bot);
registerHelpCommand(bot);
registerCatalogCommand(bot);
registerCheckStockCommand(bot);
registerUpdateStockCommand(bot);
registerSellCommand(bot);
registerStockAction(bot);
registerMenuCommand(bot);
registerExchangeCommand(bot);

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
      { command: 'exchange', description: 'Show USD → KHR exchange rate' },
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
