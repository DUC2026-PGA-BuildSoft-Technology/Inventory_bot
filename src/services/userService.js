const userModel = require('../models/userModel');

const findUserByTelegramId = async (telegramId) => {
  return userModel.findUserByTelegramId(telegramId);
};

const createUser = async (telegramId, username, firstName, lastName) => {
  return userModel.createUser(telegramId, username, firstName, lastName);
};

const findOrCreateUserByTelegram = async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username || 'Unknown';
  const firstName = ctx.from.first_name || 'Friend';
  const lastName = ctx.from.last_name || '';

  let user = await userModel.findUserByTelegramId(telegramId);
  let isNew = false;

  if (!user) {
    user = await userModel.createUser(telegramId, username, firstName, lastName);
    isNew = true;
  }

  return { user, isNew };
};

module.exports = {
  findUserByTelegramId,
  createUser,
  findOrCreateUserByTelegram,
};
