const userModel = require('../models/userModel');

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

module.exports = {
  parseCommandArgs,
  formatMoney,
  formatProductLine,
  ensureCurrentUser,
};
