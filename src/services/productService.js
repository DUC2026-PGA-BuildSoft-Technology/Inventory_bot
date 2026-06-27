const productModel = require('../models/productModel');

const listCatalogProducts = async () => {
  return productModel.listCatalogProducts();
};

const findProductByBarcode = async (barcode) => {
  return productModel.findProductByBarcode(barcode);
};

const updateStockByBarcode = async (barcode, quantity, userId) => {
  return productModel.updateStockByBarcode(barcode, quantity, userId);
};

const recordSaleByBarcode = async (barcode, quantity, userId) => {
  return productModel.recordSaleByBarcode(barcode, quantity, userId);
};

const updateProductField = async (barcode, field, value) => {
  return productModel.updateProductField(barcode, field, value);
};

const deleteProduct = async (barcode) => {
  return productModel.deleteProduct(barcode);
};

module.exports = {
  listCatalogProducts,
  findProductByBarcode,
  updateStockByBarcode,
  recordSaleByBarcode,
  updateProductField,
  deleteProduct,
};
