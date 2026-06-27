# Wiki: Technical Testing Report

This document outlines the testing architecture, mock configurations, and execution logs for the **Smart-Stock Inventory Bot** technical audit. It details our unit, integration, and end-to-end user flow testing methodologies implemented in the Zero-Crash Staging environment.

---

## 📊 1. Testing Architecture Overview

To enforce local execution reliability without database connection overhead, the bot uses a **zero-dependency test harness** built directly on Node's native `assert` module. It uses in-memory mock tables to capture database transactions.

### Test Components:
1.  **Mock Environment** ([tests/mocks.js](file:///c:/Users/KLS%20COMPUTER/Documents/PANHA-Project/Inventory_bot/tests/mocks.js)):
    *   Intercepts standard SQL database queries (queries targeting `users`, `products`, `sales`, and `stock_logs`).
    *   Simulates Telegram `ctx` (context) objects, capturing replies, callbacks, message editing, and deletion actions.
2.  **Unit Tests** ([tests/unit.test.js](file:///c:/Users/KLS%20COMPUTER/Documents/PANHA-Project/Inventory_bot/tests/unit.test.js)):
    *   Tests currency calculators, text formatting utilities, user lookup services, and product catalog methods.
3.  **Integration Tests** ([tests/integration.test.js](file:///c:/Users/KLS%20COMPUTER/Documents/PANHA-Project/Inventory_bot/tests/integration.test.js)):
    *   Tests global middlewares (specifically target ban blocks) and route fallbacks.
4.  **End-to-End Tests** ([tests/e2e.test.js](file:///c:/Users/KLS%20COMPUTER/Documents/PANHA-Project/Inventory_bot/tests/e2e.test.js)):
    *   Walks through the multi-step Product Creation wizard step-by-step, checking boundary inputs (duplicate barcodes, negative prices, strings in integers) and cancel actions.
5.  **Test Runner** ([tests/run.js](file:///c:/Users/KLS%20COMPUTER/Documents/PANHA-Project/Inventory_bot/tests/run.js)):
    *   Main orchestrator invoked by `npm test`.

---

## ⚙️ 2. Unit Testing Specifications

Unit tests ensure that discrete function blocks operate correctly under standard parameters.

| Test Case ID | Target Function | Test Action / Inputs | Expected Output |
| :--- | :--- | :--- | :--- |
| **UT-01** | `formatMoney` | Value: `7.5` | `"$7.50"` |
| **UT-02** | `formatProductLine` | Category: `Clothing`, Color: `White`, Stock: `24`, Price: `7.50` | Formatted string containing name, barcode, and specifications tree structure. |
| **UT-03** | `findOrCreateUserByTelegram` | Active Telegram ID: `22222` | Returns user record with `'seller'` role. |
| **UT-04** | `findOrCreateUserByTelegram` | Active Telegram ID: `11111` | Returns user record with `'owner'` role. |
| **UT-05** | `listCatalogProducts` | Database list check | Array of 2 mock products. |
| **UT-06** | `findProductByBarcode` | Barcode: `'885001'` | Returns `'Cotton T-Shirt'` product metadata. |
| **UT-07** | `getUserSalesHistory` | User ID: `2` | Returns array of sales rows. |
| **UT-08** | `getUserStockHistory` | User ID: `3` | Returns array of stock log rows. |
| **UT-09** | `getGlobalHistory` | System Audit | Combined array of sales and stock rows. |

---

## 🔗 3. Integration Testing Specifications

Integration tests verify that separate modules (database model wrapper, service layers, and global middleware chains) interface successfully.

### Target: Global Ban Intercept Middleware
*   **Case IT-01 (Active User)**: Simulates an active user sending a message.
    *   *Result*: Middleware calls `next()`, allowing the message to pass to bot handlers.
*   **Case IT-02 (Banned User Text)**: Simulates a banned user sending a text command.
    *   *Result*: Middleware intercepts the call, blocks execution, and replies with: `"❌ Access Denied: Your account has been banned by the administrator."`
*   **Case IT-03 (Banned User Callback)**: Simulates a banned user tapping an inline button.
    *   *Result*: Middleware intercepts the call, blocks execution, and invokes `answerCbQuery` with: `"❌ Access Denied: Your account has been banned."`

---

## 🎭 4. End-to-End (E2E) User Flow Testing

End-to-end tests simulate active user session traversals through conversational wizard steps, verifying that state cache caches inputs, checks boundaries, and commits to the database correctly.

### Flow Scenario: Conversational Product Creation Wizard
1.  **Initialization**: User clicks `➕ Add New Product`.
    *   *Assert*: Session initializes at step `'barcode'`. Bot sends Step 1 prompt.
2.  **Duplicate Barcode Check**: User sends `'885001'` (already exists).
    *   *Assert*: Bot blocks advancement, replies with a duplicate warning, and stays at step `'barcode'`.
3.  **Barcode Verification & Name Input**: User sends `'885009'` (valid barcode) -> `'Casual Shirt'` -> `'Clothing'`.
    *   *Assert*: Bot registers the barcode, outputs its length (6 characters), and advances step-by-step to Step 4.
4.  **Optional Fields (Skip)**: User sends `'-'` for color -> `'-'` for size.
    *   *Assert*: Bot skips color and size, setting them to empty, and advances to Step 6.
5.  **Stock Boundary Validation**: User sends `'abc'` (invalid integer).
    *   *Assert*: Bot blocks progress, replies with an invalid number warning, and remains at Step 6.
6.  **Price Boundary Validation**: User sends `'-10.50'` (invalid negative number).
    *   *Assert*: Bot blocks progress, replies with an invalid price warning, and remains at Step 7.
7.  **Completion & Db Insert**: User sends price `'12.50'` -> photo `'-'`.
    *   *Assert*: Bot inserts new product `'Casual Shirt'` into the products list, confirms success, and clears session state.
8.  **Wizard Cancellation**: User clicks `➕ Add New Product` -> sends `/cancel`.
    *   *Assert*: Wizard aborts, and session cache is cleared.

---

## 🚀 5. Test Execution Results

Run the test suite using `npm test` locally to verify the staging build:

```bash
npm test
```

### Staging Console Run Logs:
```text
================================================
🛡️  SMART-STOCK INVENTORY BOT - TECHNICAL AUDIT  
================================================
  🏃 Running Unit Tests...
    ✓ formatMoney helper passed
    ✓ formatProductLine helper passed
    ✓ userService.findOrCreateUserByTelegram (Seller) passed
    ✓ userService.findOrCreateUserByTelegram (Owner) passed
    ✓ productService.listCatalogProducts passed
    ✓ productService.findProductByBarcode passed
    ✓ userService.getUserSalesHistory passed
    ✓ userService.getUserStockHistory passed
    ✓ userService.getGlobalHistory passed

🟢 Unit Tests Completed Successfully!
------------------------------------------------
  🏃 Running Integration Tests...
    ✓ Middleware allows active user through passed
    ✓ Middleware blocks banned user passed
    ✓ Middleware blocks banned user callback passed

🟢 Integration Tests Completed Successfully!
------------------------------------------------
  🏃 Running End-to-End User Flow Tests...
    ✓ Wizard successfully initialized (Step 1/8: Barcode)
    ✓ Wizard blocks duplicate barcode inputs passed
    ✓ Wizard advanced to Step 2 (Product Name)
    ✓ Wizard advanced to Step 3 (Category)
    ✓ Wizard advanced to Step 4 (Color)
    ✓ Wizard advanced to Step 5 (Size)
    ✓ Wizard advanced to Step 6 (Stock Quantity)
    ✓ Wizard blocks non-integer stock quantity values passed
    ✓ Wizard advanced to Step 7 (Price)
    ✓ Wizard blocks negative unit price values passed
    ✓ Wizard advanced to Step 8 (Photo)
    ✓ Wizard completed and product created passed
    ✓ Database product verification passed
    ✓ Wizard cancel command successfully rolled back state

🟢 End-to-End Tests Completed Successfully!
------------------------------------------------

🌟 ALL TEST SUITES PASSED! [ZERO-CRASH AUDIT SUCCESS] 🌟
```
