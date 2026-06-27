const assert = require('assert');
const { createMockCtx, mockProducts } = require('./mocks');
const { registerProductCreateHandler, handleProductCreateWizard } = require('../src/handlers/stock/productCreateHandler');

const runE2ETests = async () => {
  console.log('  🏃 Running End-to-End User Flow Tests...');

  // Mock bot registry
  const actions = {};
  const mockBot = {
    action: (actionId, callback) => {
      actions[actionId] = callback;
    },
    command: (commandId, callback) => {
      actions[commandId] = callback;
    }
  };

  registerProductCreateHandler(mockBot);
  assert.ok(actions['product_add_start']);

  // Simulate starting product creation
  const ownerTelegramId = 11111;
  const startCtx = createMockCtx({ fromId: ownerTelegramId, callbackData: 'product_add_start' });
  await actions['product_add_start'](startCtx);

  assert.strictEqual(startCtx.getReplies().length, 1);
  assert.ok(startCtx.getReplies()[0].text.includes('Step 1/8:'));
  console.log('    ✓ Wizard successfully initialized (Step 1/8: Barcode)');

  // Step 1: Input Duplicate Barcode (Expect block & warning)
  const duplicateBarcodeCtx = createMockCtx({ fromId: ownerTelegramId, text: '885001' }); // 885001 already exists
  let wasHandled = await handleProductCreateWizard(duplicateBarcodeCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(duplicateBarcodeCtx.getReplies().length, 1);
  assert.ok(duplicateBarcodeCtx.getReplies()[0].text.includes('already exists'));
  console.log('    ✓ Wizard blocks duplicate barcode inputs passed');

  // Step 1: Input Valid Barcode
  const validBarcodeCtx = createMockCtx({ fromId: ownerTelegramId, text: '885009' });
  wasHandled = await handleProductCreateWizard(validBarcodeCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(validBarcodeCtx.getReplies().length, 1);
  assert.ok(validBarcodeCtx.getReplies()[0].text.includes('Step 2/8:'));
  console.log('    ✓ Wizard advanced to Step 2 (Product Name)');

  // Step 2: Input Name
  const nameCtx = createMockCtx({ fromId: ownerTelegramId, text: 'Casual Shirt' });
  wasHandled = await handleProductCreateWizard(nameCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(nameCtx.getReplies().length, 1);
  assert.ok(nameCtx.getReplies()[0].text.includes('Step 3/8:'));
  console.log('    ✓ Wizard advanced to Step 3 (Category)');

  // Step 3: Input Category
  const catCtx = createMockCtx({ fromId: ownerTelegramId, text: 'Clothing' });
  wasHandled = await handleProductCreateWizard(catCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(catCtx.getReplies().length, 1);
  assert.ok(catCtx.getReplies()[0].text.includes('Step 4/8:'));
  console.log('    ✓ Wizard advanced to Step 4 (Color)');

  // Step 4: Input Color (skip with '-')
  const colorCtx = createMockCtx({ fromId: ownerTelegramId, text: '-' });
  wasHandled = await handleProductCreateWizard(colorCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(colorCtx.getReplies().length, 1);
  assert.ok(colorCtx.getReplies()[0].text.includes('Step 5/8:'));
  console.log('    ✓ Wizard advanced to Step 5 (Size)');

  // Step 5: Input Size (skip with '-')
  const sizeCtx = createMockCtx({ fromId: ownerTelegramId, text: '-' });
  wasHandled = await handleProductCreateWizard(sizeCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(sizeCtx.getReplies().length, 1);
  assert.ok(sizeCtx.getReplies()[0].text.includes('Step 6/8:'));
  console.log('    ✓ Wizard advanced to Step 6 (Stock Quantity)');

  // Step 6: Input invalid Stock Quantity
  const invalidStockCtx = createMockCtx({ fromId: ownerTelegramId, text: 'abc' });
  wasHandled = await handleProductCreateWizard(invalidStockCtx);
  assert.strictEqual(wasHandled, true);
  assert.ok(invalidStockCtx.getReplies()[0].text.includes('stock'));
  console.log('    ✓ Wizard blocks non-integer stock quantity values passed');

  // Step 6: Input valid Stock Quantity
  const stockCtx = createMockCtx({ fromId: ownerTelegramId, text: '50' });
  wasHandled = await handleProductCreateWizard(stockCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(stockCtx.getReplies().length, 1);
  assert.ok(stockCtx.getReplies()[0].text.includes('Step 7/8:'));
  console.log('    ✓ Wizard advanced to Step 7 (Price)');

  // Step 7: Input invalid Price
  const invalidPriceCtx = createMockCtx({ fromId: ownerTelegramId, text: '-10.50' });
  wasHandled = await handleProductCreateWizard(invalidPriceCtx);
  assert.strictEqual(wasHandled, true);
  assert.ok(invalidPriceCtx.getReplies()[0].text.includes('price'));
  console.log('    ✓ Wizard blocks negative unit price values passed');

  // Step 7: Input valid Price
  const priceCtx = createMockCtx({ fromId: ownerTelegramId, text: '12.50' });
  wasHandled = await handleProductCreateWizard(priceCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(priceCtx.getReplies().length, 1);
  assert.ok(priceCtx.getReplies()[0].text.includes('Step 8/8:'));
  console.log('    ✓ Wizard advanced to Step 8 (Photo)');

  // Step 8: Complete with skip photo '-'
  const photoCtx = createMockCtx({ fromId: ownerTelegramId, text: '-' });
  wasHandled = await handleProductCreateWizard(photoCtx);
  assert.strictEqual(wasHandled, true);
  assert.strictEqual(photoCtx.getReplies().length, 1);
  assert.ok(photoCtx.getReplies()[0].text.includes('Successfully'));
  console.log('    ✓ Wizard completed and product created passed');

  // Verify product is in memory mock database list
  const lastProduct = mockProducts[mockProducts.length - 1];
  assert.strictEqual(lastProduct.barcode, '885009');
  assert.strictEqual(lastProduct.product_name, 'Casual Shirt');
  assert.strictEqual(lastProduct.stock_quantity, 50);
  assert.strictEqual(lastProduct.price, 12.50);
  console.log('    ✓ Database product verification passed');

  // Test Cancel Action
  await actions['product_add_start'](startCtx);
  const cancelCtx = createMockCtx({ fromId: ownerTelegramId, text: '/cancel' });
  wasHandled = await handleProductCreateWizard(cancelCtx);
  assert.strictEqual(wasHandled, true);
  assert.ok(cancelCtx.getReplies()[0].text.includes('cancelled'));
  console.log('    ✓ Wizard cancel command successfully rolled back state');
};

module.exports = { runE2ETests };
