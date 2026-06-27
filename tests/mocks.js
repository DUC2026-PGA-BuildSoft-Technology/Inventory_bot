const db = require('../src/config/db');

// In-memory mock database tables
const mockUsers = [
  { id: 1, telegram_id: 11111, username: 'testowner', first_name: 'Test', last_name: 'Owner', role: 'owner', status: 'active' },
  { id: 2, telegram_id: 22222, username: 'testseller', first_name: 'Test', last_name: 'Seller', role: 'seller', status: 'active' },
  { id: 3, telegram_id: 33333, username: 'teststock', first_name: 'Test', last_name: 'Stock', role: 'stock-manager', status: 'active' },
  { id: 4, telegram_id: 44444, username: 'banneduser', first_name: 'Banned', last_name: 'User', role: 'seller', status: 'banned' },
];

const mockProducts = [
  { id: 1, barcode: '885001', product_name: 'Cotton T-Shirt', category: 'Clothing', color: 'White', size: 'M', stock_quantity: 24, price: 7.50, status: 'in_stock', image_url: 'http://example.com/tshirt.jpg' },
  { id: 2, barcode: '885002', product_name: 'Denim Jeans', category: 'Clothing', color: 'Blue', size: '32', stock_quantity: 8, price: 15.00, status: 'in_stock', image_url: '' },
];

const mockSales = [];
const mockStockLogs = [];
const mockNotifications = [];

// Intercept queries
db.query = async (text, params) => {
  const queryText = text.trim().replace(/\s+/g, ' ').toLowerCase();

  // Find user by telegram id
  if (queryText.includes('from users where telegram_id =') || queryText.includes('from users where telegram_id=')) {
    const telegramId = params[0];
    const user = mockUsers.find(u => u.telegram_id === Number(telegramId));
    return { rows: user ? [user] : [] };
  }

  // Find all users
  if (queryText.includes('from users order by')) {
    return { rows: mockUsers };
  }

  // Insert user
  if (queryText.includes('insert into users')) {
    const newUser = {
      id: mockUsers.length + 1,
      telegram_id: Number(params[0]),
      username: params[1],
      first_name: params[2],
      last_name: params[3],
      role: params[4] || 'seller',
      status: 'active'
    };
    mockUsers.push(newUser);
    return { rows: [newUser] };
  }

  // Update user role
  if (queryText.includes('update users set role =')) {
    const role = params[0];
    const telegramId = params[1];
    const user = mockUsers.find(u => u.telegram_id === Number(telegramId));
    if (user) user.role = role;
    return { rowCount: 1 };
  }

  // Update user status (ban/unban)
  if (queryText.includes('update users set status =')) {
    const status = params[0];
    const telegramId = params[1];
    const user = mockUsers.find(u => u.telegram_id === Number(telegramId));
    if (user) user.status = status;
    return { rowCount: 1 };
  }

  // Delete user
  if (queryText.includes('delete from users where telegram_id =')) {
    const telegramId = params[0];
    const idx = mockUsers.findIndex(u => u.telegram_id === Number(telegramId));
    if (idx !== -1) mockUsers.splice(idx, 1);
    return { rowCount: 1 };
  }

  // List products
  if (queryText.includes('from products') && queryText.includes('order by')) {
    return { rows: mockProducts };
  }

  // Find product by barcode
  if (queryText.includes('from products where barcode =') || queryText.includes('from products where barcode=')) {
    const barcode = params[0];
    const product = mockProducts.find(p => p.barcode === barcode);
    return { rows: product ? [product] : [] };
  }

  // Insert product
  if (queryText.includes('insert into products')) {
    const newProduct = {
      id: mockProducts.length + 1,
      barcode: params[0],
      product_name: params[1],
      category: params[2],
      color: params[3],
      size: params[4],
      stock_quantity: Number(params[5]),
      price: Number(params[6]),
      image_url: params[7],
      status: Number(params[5]) > 0 ? 'in_stock' : 'out_of_stock'
    };
    mockProducts.push(newProduct);
    return { rows: [newProduct] };
  }

  // Update product stock
  if (queryText.includes('update products set stock_quantity =')) {
    const stock = Number(params[0]);
    const status = params[1];
    const barcode = params[2];
    const product = mockProducts.find(p => p.barcode === barcode);
    if (product) {
      product.stock_quantity = stock;
      product.status = status;
    }
    return { rowCount: 1 };
  }

  // Insert sale
  if (queryText.includes('insert into sales')) {
    const newSale = {
      id: mockSales.length + 1,
      product_id: params[0],
      quantity: params[1],
      total_price: params[2],
      sold_by_user_id: params[3],
      sale_date: new Date()
    };
    mockSales.push(newSale);
    return { rows: [newSale] };
  }

  // Insert stock log
  if (queryText.includes('insert into stock_logs')) {
    const log = {
      id: mockStockLogs.length + 1,
      product_id: params[0],
      adjustment_quantity: params[1],
      action_type: params[2],
      adjusted_by_user_id: params[3],
      notes: params[4]
    };
    mockStockLogs.push(log);
    return { rows: [log] };
  }

  // Reports queries
  if (queryText.includes('sum(total_price)')) {
    return {
      rows: [
        { product_name: 'Cotton T-Shirt', category: 'Clothing', total_qty: 4, total_revenue: 30.00 }
      ]
    };
  }

  if (queryText.includes('union all')) {
    return {
      rows: [
        { type: 'sale', date: new Date(), product_name: 'Cotton T-Shirt', details: '2', done_by: 'Test Seller' },
        { type: 'stock', date: new Date(), product_name: 'Cotton T-Shirt', details: 'restock (10)', done_by: 'Test Stock' }
      ]
    };
  }

  if (queryText.includes('from sales s join products p')) {
    return {
      rows: [
        { product_name: 'Cotton T-Shirt', quantity: 2, total_price: 15.00, sold_at: new Date() }
      ]
    };
  }

  if (queryText.includes('from stock_logs sl join products p')) {
    return {
      rows: [
        { product_name: 'Cotton T-Shirt', action_type: 'restock', quantity_changed: 10, note: 'Initial restock', created_at: new Date() }
      ]
    };
  }

  if (queryText.includes('stock_logs')) {
    return {
      rows: [
        { product_name: 'Cotton T-Shirt', total_added: 10, total_reduced: 0 }
      ]
    };
  }

  // Fallback return empty
  return { rows: [] };
};

// Mock connection pool connect
db.pool.query = db.query;
db.pool.connect = async () => {
  return {
    query: db.query,
    release: () => {}
  };
};

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
