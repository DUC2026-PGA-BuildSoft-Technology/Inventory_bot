const assert = require('assert');
const { formatMoney, formatProductLine } = require('../src/bot/helpers');
const userService = require('../src/services/userService');
const productService = require('../src/services/productService');

const runUnitTests = async () => {
  console.log('  🏃 Running Unit Tests...');

  // Test 1: formatMoney helper
  assert.strictEqual(formatMoney(0), '$0.00');
  assert.strictEqual(formatMoney(7.5), '$7.50');
  assert.strictEqual(formatMoney(199.999), '$200.00');
  console.log('    ✓ formatMoney helper passed');

  // Test 2: formatProductLine helper
  const dummyProd = {
    product_name: 'Cotton T-Shirt',
    category: 'Clothing',
    color: 'White',
    size: 'M',
    barcode: '885001',
    stock_quantity: 24,
    price: 7.50,
    status: 'in_stock'
  };
  const line = formatProductLine(dummyProd, 0);
  assert.ok(line.includes('Cotton T-Shirt'));
  assert.ok(line.includes('Clothing | White | M'));
  assert.ok(line.includes('Barcode: <code>885001</code>'));
  assert.ok(line.includes('Stock: 24'));
  assert.ok(line.includes('Price: $7.50'));
  console.log('    ✓ formatProductLine helper passed');

  // Test 3: userService findOrCreateUserByTelegram (Seller Profile Retrieval)
  const ctxSeller = {
    from: {
      id: 22222,
      username: 'testseller',
      first_name: 'Test',
      last_name: 'Seller'
    }
  };
  const sellerProfile = await userService.findOrCreateUserByTelegram(ctxSeller);
  assert.ok(sellerProfile.user);
  assert.strictEqual(sellerProfile.user.role, 'seller');
  assert.strictEqual(sellerProfile.user.status, 'active');
  console.log('    ✓ userService.findOrCreateUserByTelegram (Seller) passed');

  // Test 4: userService findOrCreateUserByTelegram (Owner Registration Check)
  const ctxOwner = {
    from: {
      id: 11111,
      username: 'testowner',
      first_name: 'Test',
      last_name: 'Owner'
    }
  };
  const ownerProfile = await userService.findOrCreateUserByTelegram(ctxOwner);
  assert.ok(ownerProfile.user);
  assert.strictEqual(ownerProfile.user.role, 'owner');
  console.log('    ✓ userService.findOrCreateUserByTelegram (Owner) passed');

  // Test 5: productService.listCatalogProducts
  const products = await productService.listCatalogProducts();
  assert.ok(products.length >= 2);
  assert.strictEqual(products[0].barcode, '885001');
  assert.strictEqual(products[1].barcode, '885002');
  console.log('    ✓ productService.listCatalogProducts passed');

  // Test 6: productService.findProductByBarcode
  const product = await productService.findProductByBarcode('885001');
  assert.ok(product);
  assert.strictEqual(product.product_name, 'Cotton T-Shirt');
  assert.strictEqual(product.price, 7.50);
  console.log('    ✓ productService.findProductByBarcode passed');

  // Test 7: userService.getUserSalesHistory
  const userSales = await userService.getUserSalesHistory(2);
  assert.strictEqual(userSales.length, 1);
  assert.strictEqual(userSales[0].product_name, 'Cotton T-Shirt');
  console.log('    ✓ userService.getUserSalesHistory passed');

  // Test 8: userService.getUserStockHistory
  const userStock = await userService.getUserStockHistory(3);
  assert.strictEqual(userStock.length, 1);
  assert.strictEqual(userStock[0].action_type, 'restock');
  console.log('    ✓ userService.getUserStockHistory passed');

  // Test 9: userService.getGlobalHistory
  const globalHistory = await userService.getGlobalHistory();
  assert.strictEqual(globalHistory.length, 2);
  assert.strictEqual(globalHistory[0].type, 'sale');
  console.log('    ✓ userService.getGlobalHistory passed');
};

module.exports = { runUnitTests };
