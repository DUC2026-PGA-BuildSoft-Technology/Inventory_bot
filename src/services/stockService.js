const productService = require('./productService');

const updateStock = async (barcode, quantity, userId) => {
  // Business logic wrapper for stock updates.
  // Delegates to lower-level productService which interacts with the DB.
  return productService.updateStockByBarcode(barcode, quantity, userId);
};

const getStockMovementReport = async (timeframe) => {
  return productService.getStockMovementReport(timeframe);
};

module.exports = {
  updateStock,
  getStockMovementReport,
};
