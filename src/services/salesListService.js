const productService = require('./productService');
const salesService = require('./salesService');

// In-memory store: telegramId -> { barcode: quantity }
const activeSalesLists = {};

/**
 * Get all items in the sales list with full product details
 * @param {number} telegramId 
 * @returns {Promise<{items: Array<{product: Object, quantity: number, subtotal: number}>, totalAmount: number, totalItems: number}>}
 */
const getSalesList = async (telegramId) => {
  const list = activeSalesLists[telegramId] || {};
  const items = [];
  let totalAmount = 0;
  let totalItems = 0;

  for (const [barcode, quantity] of Object.entries(list)) {
    if (quantity > 0) {
      const product = await productService.findProductByBarcode(barcode);
      if (product) {
        const subtotal = Number(product.price) * quantity;
        items.push({
          product,
          quantity,
          subtotal,
        });
        totalAmount += subtotal;
        totalItems += quantity;
      }
    }
  }

  return { items, totalAmount, totalItems };
};

/**
 * Add or increment a product in the user's active sales list
 * @param {number} telegramId 
 * @param {string} barcode 
 * @returns {number} The new quantity of the product in the sales list
 */
const addToSalesList = (telegramId, barcode) => {
  if (!activeSalesLists[telegramId]) {
    activeSalesLists[telegramId] = {};
  }
  const list = activeSalesLists[telegramId];
  list[barcode] = (list[barcode] || 0) + 1;
  return list[barcode];
};

/**
 * Decrement a product in the user's active sales list
 * @param {number} telegramId 
 * @param {string} barcode 
 * @returns {number} The new quantity (0 if removed)
 */
const removeFromSalesList = (telegramId, barcode) => {
  const list = activeSalesLists[telegramId];
  if (!list || !list[barcode]) return 0;
  
  list[barcode] -= 1;
  if (list[barcode] <= 0) {
    delete list[barcode];
    return 0;
  }
  return list[barcode];
};

/**
 * Get quantity of a product currently in the user's sales list
 * @param {number} telegramId 
 * @param {string} barcode 
 * @returns {number}
 */
const getQuantityInSalesList = (telegramId, barcode) => {
  const list = activeSalesLists[telegramId];
  return list ? (list[barcode] || 0) : 0;
};

/**
 * Clear the user's active sales list
 * @param {number} telegramId 
 */
const clearSalesList = (telegramId) => {
  delete activeSalesLists[telegramId];
};

/**
 * Confirm and checkout the sales list, recording sales in the database
 * @param {number} telegramId 
 * @param {number} userId 
 * @returns {Promise<{success: boolean, results: Array, totalProcessedAmount: number, reason?: string}>}
 */
const confirmCheckout = async (telegramId, userId) => {
  const { items } = await getSalesList(telegramId);
  if (items.length === 0) {
    return { success: false, reason: 'empty_list' };
  }

  const results = [];
  let totalProcessedAmount = 0;
  let hasFailures = false;

  for (const item of items) {
    // Call the database-backed recordSale which decrements stock and writes to DB tables
    const result = await salesService.recordSale(item.product.barcode, item.quantity, userId);
    
    results.push({
      product: item.product,
      quantity: item.quantity,
      status: result.status,
      totalPrice: result.totalPrice || 0,
      availableStock: result.product ? result.product.stock_quantity : 0,
    });

    if (result.status === 'sold') {
      totalProcessedAmount += result.totalPrice;
      if (activeSalesLists[telegramId]) {
        delete activeSalesLists[telegramId][item.product.barcode];
      }
    } else {
      hasFailures = true;
    }
  }

  // Clear list only if checkout completely succeeds (or succeeds for processed items)
  if (!hasFailures) {
    clearSalesList(telegramId);
  }

  return { success: !hasFailures, results, totalProcessedAmount };
};

module.exports = {
  getSalesList,
  addToSalesList,
  removeFromSalesList,
  getQuantityInSalesList,
  clearSalesList,
  confirmCheckout,
};
