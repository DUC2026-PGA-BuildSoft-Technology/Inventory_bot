const salesService = require('../../services/salesService');
const userService = require('../../services/userService');
const { formatMoney } = require('../../bot/helpers');

const registerOwnerReportCommand = (bot) => {
  // Command: Owner Report (CLI Fallback)
  bot.command('owner_report', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      
      if (!user) {
        await ctx.reply('Error: Could not retrieve user profile.');
        return;
      }

      // Security check: Only the owner or admin roles can retrieve financial records
      if (user.role !== 'owner' && user.role !== 'admin') {
        await ctx.reply('⚠️ Access Denied: This command is restricted to the Store Owner only.');
        return;
      }

      const report = await salesService.getTodaySalesReport();
      const todayString = new Date().toLocaleDateString();

      let text = [
        `📊 <b>Daily Sales Report (Today)</b>`,
        `Date: <b>${todayString}</b>`,
        '',
        '<b>Summary of Items Sold:</b>',
      ];

      if (report.items.length === 0) {
        text.push('No sales recorded today.');
      } else {
        report.items.forEach((item) => {
          text.push(`• <b>${item.product_name}</b> (${item.category}): x${item.total_qty} sold | Total: ${formatMoney(item.total_amount)}`);
        });
      }

      text.push(
        '----------------------------------',
        `💰 <b>Grand Total Revenue:</b> <code>${formatMoney(report.grandTotal)}</code>`
      );

      await ctx.reply(text.join('\n'), {
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.error('Error in /owner_report:', err);
      await ctx.reply('Could not retrieve today\'s sales report. Please try again later.');
    }
  });

  // Action: Owner Report Button Click (Elimination of Typed Arguments)
  bot.action('owner_report_view', async (ctx) => {
    try {
      const { user } = await userService.findOrCreateUserByTelegram(ctx);
      
      if (!user) {
        await ctx.answerCbQuery('User profile error');
        return;
      }

      // Security validation
      if (user.role !== 'owner' && user.role !== 'admin') {
        await ctx.answerCbQuery('Access Denied: Owner permissions required.', { show_alert: true });
        return;
      }

      await ctx.answerCbQuery();
      const report = await salesService.getTodaySalesReport();
      const todayString = new Date().toLocaleDateString();

      let text = [
        `📊 <b>Daily Sales Report (Today)</b>`,
        `Date: <b>${todayString}</b>`,
        '',
        '<b>Summary of Items Sold:</b>',
      ];

      if (report.items.length === 0) {
        text.push('No sales recorded today.');
      } else {
        report.items.forEach((item) => {
          text.push(`• <b>${item.product_name}</b> (${item.category}): x${item.total_qty} sold | Total: ${formatMoney(item.total_amount)}`);
        });
      }

      text.push(
        '----------------------------------',
        `💰 <b>Grand Total Revenue:</b> <code>${formatMoney(report.grandTotal)}</code>`
      );

      const keyboard = [
        [{ text: '📋 Main Menu', callback_data: 'menu_view' }]
      ];

      await ctx.editMessageText(text.join('\n'), {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (err) {
      console.error('Error in owner_report_view action:', err);
      await ctx.answerCbQuery('Error loading sales report');
    }
  });
};

module.exports = { registerOwnerReportCommand };
