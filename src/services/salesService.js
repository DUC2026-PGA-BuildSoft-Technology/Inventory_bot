const productService = require('./productService');

const recordSale = async (barcode, quantity, userId) => {
  // Business logic wrapper for recording sales.
  return productService.recordSaleByBarcode(barcode, quantity, userId);
};

module.exports = { recordSale };
