const userModel = require('../models/userModel');

const findUserByTelegramId = async (telegramId) => {
  return userModel.findUserByTelegramId(telegramId);
};

const createUser = async (telegramId, username, firstName, lastName) => {
  return userModel.createUser(telegramId, username, firstName, lastName);
};

const findOrCreateUserByTelegram = async (ctx) => {
  if (!ctx || !ctx.from || !ctx.from.id) {
    throw new Error('Invalid Telegram session: User ID not found');
  }

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

const listAllUsers = async () => {
  return userModel.listAllUsers();
};

const updateUserRole = async (userId, newRole) => {
  return userModel.updateUserRole(userId, newRole);
};

const updateUserStatus = async (userId, newStatus) => {
  return userModel.updateUserStatus(userId, newStatus);
};

const deleteUser = async (userId) => {
  return userModel.deleteUser(userId);
};

const getUserSalesHistory = async (userId) => {
  return userModel.getUserSalesHistory(userId);
};

const getUserStockHistory = async (userId) => {
  return userModel.getUserStockHistory(userId);
};

const getGlobalHistory = async () => {
  return userModel.getGlobalHistory();
};

module.exports = {
  findUserByTelegramId,
  createUser,
  findOrCreateUserByTelegram,
  listAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserSalesHistory,
  getUserStockHistory,
  getGlobalHistory,
};
