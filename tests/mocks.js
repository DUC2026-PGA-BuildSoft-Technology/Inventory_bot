const db = require('../src/config/db');
const mockDb = require('../src/config/mockDb');

// Access shared in-memory database tables
const mockUsers = mockDb.mockUsers;
const mockProducts = mockDb.mockProducts;
const mockSales = mockDb.mockSales;
const mockStockLogs = mockDb.mockStockLogs;
const mockNotifications = mockDb.mockNotifications;

// Intercept queries
db.query = mockDb.query;

// Mock connection pool query and connect methods
if (db.pool) {
  db.pool.query = db.query;
  db.pool.connect = async () => {
    return {
      query: db.query,
      release: () => {}
    };
  };
}

// Mock Telegraf context creator
const createMockCtx = ({ fromId, fromUsername, text, callbackData }) => {
  const replies = [];
  const cbAlerts = [];
  let editedMessage = null;
  let isDeleted = false;

  const ctx = {
    from: {
      id: fromId || 22222,
      username: fromUsername || 'testseller',
      first_name: 'Test',
      last_name: 'User'
    },
    message: text ? { text } : null,
    callbackQuery: callbackData ? {
      data: callbackData,
      from: { id: fromId || 22222, username: fromUsername || 'testseller' },
      message: { message_id: 999 }
    } : null,
    reply: async (text, options) => {
      replies.push({ text, options });
      return { message_id: 100 + replies.length };
    },
    replyWithPhoto: async (url, options) => {
      replies.push({ photoUrl: url, caption: options.caption, options });
      return { message_id: 100 + replies.length };
    },
    answerCbQuery: async (text, options) => {
      cbAlerts.push({ text, options });
      return true;
    },
    editMessageText: async (text, options) => {
      editedMessage = { text, options };
      return true;
    },
    deleteMessage: async () => {
      isDeleted = true;
      return true;
    },
    getReplies: () => replies,
    getCbAlerts: () => cbAlerts,
    getEditedMessage: () => editedMessage,
    getIsDeleted: () => isDeleted
  };

  return ctx;
};

module.exports = {
  createMockCtx,
  mockUsers,
  mockProducts,
  mockSales,
  mockStockLogs,
  mockNotifications
};
