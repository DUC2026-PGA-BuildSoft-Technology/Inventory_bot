# Test Verification Matrix - Week 11 Milestone

This page documents the complete test matrix for the **Smart-Stock Inventory Bot** technical audit. It logs **36 distinct test cases** covering Happy Paths, Boundary Limits, Negative Scenarios, and security/execution attacks to ensure a **Zero-Crash Staging environment**.

---

## 📊 Summary of Test Scenarios

| Category | Total Cases | Target Objective |
| :--- | :--- | :--- |
| **Happy Paths** | 15 | Core system workflows (Start, Catalog, Cart, Exchange, Checkout, User Manager, Stock Clear, Account Delete, View Reports, Sales timeframe reports, Product Creation Wizard) |
| **Boundary Limits** | 2 | Constraints on stock levels and zero-value bounds |
| **Negative Scenarios** | 2 | Empty lists, database connection checks, and mock API failures |
| **Execution Attacks** | 17 | Malformed commands, concurrent clicks, role verification, account bans, banned requests block, duplicate barcodes, and unauthorized accesses |

---

## 📋 Comprehensive Test Matrix Log

### 1. Happy Paths

#### Test Case 01: User Initialization & Registration (`/start`)
*   **Input**: Send `/start` command.
*   **Pre-condition**: User does not exist in the database.
*   **Expected Behavior**: Database inserts a new row in the `users` table with role `'seller'`. Bot replies with a welcome message and inline buttons (`📖 View Catalog`, `📋 View Sale List`).
*   **Status**: PASS ✅

#### Test Case 02: Return to Main Menu (`menu_view` callback)
*   **Input**: Tap `📋 Main Menu` button on any screen.
*   **Expected Behavior**: Bot triggers callback handler, calls `ctx.answerCbQuery()` to clear the spinner, and updates the active message in-place to the welcome menu screen.
*   **Status**: PASS ✅

#### Test Case 03: Live Product Catalog (`/view_catalog`)
*   **Input**: Send `/view_catalog` or click `📖 View Catalog` button.
*   **Expected Behavior**: Bot fetches products from the database, renders a list of name/barcode/stock lines, and shows inline buttons representing products.
*   **Status**: PASS ✅

#### Test Case 04: Product Detail In-Place View (`stock:barcode` callback)
*   **Input**: Click on the `Cotton T-Shirt (24)` button in the catalog.
*   **Expected Behavior**: Bot resolves callback query immediately and edits the active message to show categories, price, stock, and current quantity in the sales list.
*   **Status**: PASS ✅

#### Test Case 05: Add Item to Sales List (`sale_add:barcode` callback)
*   **Input**: Click `➕ Add to Sale` on the Cotton T-Shirt screen.
*   **Expected Behavior**: Bot increments the quantity of the item in the user's active sales list and edits the message to display `📦 In Current Sale List: 1 units`. No loading spinner hangs.
*   **Status**: PASS ✅

#### Test Case 06: Remove Item from Sales List (`sale_sub:barcode` callback)
*   **Input**: Click `➖ Remove` on the Cotton T-Shirt screen (quantity currently 1).
*   **Expected Behavior**: Bot decrements the quantity to 0, removes the item from the sales list, and edits the screen to show `📦 In Current Sale List: 0 units` (and hides the `➖ Remove` button).
*   **Status**: PASS ✅

#### Test Case 07: Review Sales List (`sales_list_view` callback)
*   **Input**: Tap `📋 View Sale List` on the catalog menu.
*   **Expected Behavior**: Bot prints a summary of all items in the sales list, showing quantities, prices, subtotals, and the total transaction value.
*   **Status**: PASS ✅

#### Test Case 08: Successful Sale Transaction Confirmation (`sales_list_confirm`)
*   **Input**: Tap `✅ Confirm Sale / Checkout` with products in the sales list.
*   **Expected Behavior**: Database updates products stock, records sales in `sales` table, inserts audit log in `stock_logs`, clears in-memory list, and prints a success receipt.
*   **Status**: PASS ✅

#### Test Case 09: Exchange Rate Query (`/exchange`)
*   **Input**: Send `/exchange` command.
*   **Expected Behavior**: Bot queries the public USD/KHR Exchange API and responds with the current rate (e.g. `1 USD = 4,100 KHR`).
*   **Status**: PASS ✅

#### Test Case 25: Interactive User Management directory & promotion (`user_role` callback)
*   **Input**: Click `👤 Manage Users` -> select a user -> click `🔧 Stock Manager` as Owner.
*   **Expected Behavior**: Database updates target user's role to `'stock-manager'`, resolves callback spinner, triggers pop-up alert: `"Role successfully updated to stock-manager!"` and updates user card in-place.
*   **Status**: PASS ✅

#### Test Case 26: Reset Stock Count to Zero (`adj_clear` callback)
*   **Input**: Click `🧹 Clear Stock (Reset to 0)` on Denim Jeans (stock 8) as stock-manager.
*   **Expected Behavior**: Database updates Denim Jeans stock to 0, status to `'out_of_stock'`, logs a `stock_out` row in `stock_logs` with notes, pops up a success alert, and re-renders the Stock Adjustment Menu showing `0 units`.
*   **Status**: PASS ✅

#### Test Case 30: View Reports Access (`reports_dashboard_view` callback)
*   **Input**: Click `📊 View Reports` as Owner/Manager.
*   **Expected Behavior**: Bot renders the View Reports menu containing 6 timeframe options and a Main Menu option. Callback query is cleared.
*   **Status**: PASS ✅

#### Test Case 31: Weekly/Monthly Sales Report Aggregation (`report_sales` callback)
*   **Input**: Tap `🛒 Sales: Weekly` or `🛒 Sales: Monthly`.
*   **Expected Behavior**: Bot executes aggregate query covering the rolling last 7 or 30 days, displays each product category sum, and prints the grand total USD revenue.
*   **Status**: PASS ✅

#### Test Case 32: Stock Movement Logs Summary (`report_stock` callback)
*   **Input**: Tap `📦 Stock: Weekly` or `📦 Stock: Monthly`.
*   **Expected Behavior**: Bot queries `stock_logs` grouped by product, counting positive restocks (`+`) and negative write-offs/sales (`-`), and displays them inline.
*   **Status**: PASS ✅

---

### 2. Boundary Limits

#### Test Case 10: Stock Limit Constraint Boundary (`sale_add` threshold)
*   **Input**: Continuously click `➕ Add to Sale` for Denim Jeans until quantity matches the database stock (e.g. 8). Click `➕ Add to Sale` once more.
*   **Expected Behavior**: Bot checks `currentInList >= availableStock`, blocks the addition, and shows the notification: `"Cannot add: Exceeds available stock"` via a pop-up alert. Stock remains at 8.
*   **Status**: PASS ✅

#### Test Case 11: Negative Manual Quantity Inputs (`/update_stock`)
*   **Input**: Send `/update_stock 885002 -50` (reducing stock below zero).
*   **Expected Behavior**: Service checks database constraints. DB rejects with constraint violation or model returns `insufficient_stock`. Bot replies: `"Cannot reduce Denim Jeans below zero. Current stock: 8"`.
*   **Status**: PASS ✅

---

### 3. Negative Scenarios

#### Test Case 12: Empty Sales List Checkout Validation
*   **Input**: Tap `✅ Confirm Sale / Checkout` when no items have been added to the sales list.
*   **Expected Behavior**: Service catches `items.length === 0`, returns `empty_list` failure, and bot prints: `"Your sales transaction list is empty."`
*   **Status**: PASS ✅

#### Test Case 13: External API Failure Handling (`/exchange` down)
*   **Input**: Mock API response to timeout or return a 500 error. Send `/exchange`.
*   **Expected Behavior**: `apiService.js` catches the request failure within its `try-catch` block, returns `success: false`, and the bot prints the fallback error message: `"Unable to retrieve exchange rate. Please try again later."` without crashing.
*   **Status**: PASS ✅

---

### 4. Zero-Crash Execution & Security Attacks

#### Test Case 14: Random Text Execution Attack
*   **Input**: Send random strings like `"hello"`, `"garbage text"`, or `"18721381273981"` to the bot.
*   **Expected Behavior**: The bot's unmatched text fallback catches the message and replies politely: `"Sorry, I did not recognize that command. Please use the menu buttons below to browse inventory!"` preventing server crashes.
*   **Status**: PASS ✅

#### Test Case 15: Missing/Malformed Command Arguments Injection
*   **Input**: Send commands without parameters: `/sell`, `/update_stock`, or `/check_stock`. Or send malformed arguments: `/sell abc xyz`.
*   **Expected Behavior**: Argument validator catches `Number.isNaN(quantity)` or `!barcode`, aborts execution, and replies with correct command usage guides. No crashes occur.
*   **Status**: PASS ✅

#### Test Case 16: Multi-Click Race Condition (Double Tap Checkout)
*   **Input**: Rapidly click the `✅ Confirm Sale / Checkout` button twice in under 100ms.
*   **Expected Behavior**: The first click acquires a transaction row lock on products and confirms the sale. The second click executes concurrently but finds the user's sales list already cleared by the first process, returning `empty_list` gracefully. Server process does not crash.
*   **Status**: PASS ✅

#### Test Case 17: Authorized Owner Report Access (`/owner_report` as Owner/Manager)
*   **Input**: Set user role to `manager` using `node change_role.js [id] manager`, then send `/owner_report` command.
*   **Expected Behavior**: Bot validates role, aggregates today's transactions by category, sums today's grand revenue, and sends a formatted sales summary.
*   **Status**: PASS ✅

#### Test Case 18: Unauthorized Owner Report Blocked (`/owner_report` as Seller)
*   **Input**: Set user role to `seller` using `node change_role.js [id] seller`, then send `/owner_report` command.
*   **Expected Behavior**: Bot detects `user.role !== 'owner'` and `!== 'manager'`, aborts data query, and blocks access: `"⚠️ Access Denied: This command is restricted to the Store Owner and Managers only."`
*   **Status**: PASS ✅

#### Test Case 19: Conversational Custom Intake (`adj_custom` restock)
*   **Input**: Tap `✏️ Custom Amount` on a product adjustment menu. Type `13` and send.
*   **Expected Behavior**: Bot receives `13`, updates product stock count by +13, creates `stock_in` audit log in `stock_logs` table, and prints a success confirmation card showing the new stock balance.
*   **Status**: PASS ✅

#### Test Case 20: Conversational Custom Reduction (`adj_custom` write-off)
*   **Input**: Tap `✏️ Custom Amount` on a product adjustment menu. Type `-7` and send.
*   **Expected Behavior**: Bot receives `-7`, decrements stock count by 7, logs a `stock_out` row in `stock_logs`, and displays the updated balance card.
*   **Status**: PASS ✅

#### Test Case 21: Conversational Custom Adjustment Cancelled (`/cancel`)
*   **Input**: Tap `✏️ Custom Amount`. Type `/cancel` and send.
*   **Expected Behavior**: Bot clears the user's active session state in-memory, rolls back any adjustments, and displays a cancellation confirmation with catalog navigation buttons.
*   **Status**: PASS ✅

#### Test Case 22: Conversational Edit Product Field (Authorized Owner/Manager)
*   **Input**: Tap `✏️ Edit` -> `🏷️ Name`. Type `"Super Cotton T-Shirt"` and send.
*   **Expected Behavior**: Bot receives text input, validates manager/owner role, executes SQL update to change the name, clears session state, and prints a success card showing the new value.
*   **Status**: PASS ✅

#### Test Case 23: Delete Product and Associated Logs (Authorized Owner/Manager)
*   **Input**: Tap `❌ Delete` -> click `Yes, Delete`.
*   **Expected Behavior**: Bot executes database `DELETE` query, removes the product row, cascades and deletes its logs in `stock_logs` and `notifications` tables, and returns the user to the updated catalog list.
*   **Status**: PASS ✅

#### Test Case 24: Native Menu commands list button
*   **Input**: Open chat with the bot. Check next to the attach icon.
*   **Expected Behavior**: Telegram client displays the blue "Menu" button next to the input text bar. Tapping it displays all registered slash commands dynamically.
*   **Status**: PASS ✅

#### Test Case 27: User Banned Global Intercept
*   **Input**: Click `🚫 Ban User` on a user card as Owner. Switch to the banned user's account and send `/start` or click any catalog buttons.
*   **Expected Behavior**: Database updates user status to `'banned'`. When the banned user tries to interact, the global middleware intercepts the request, blocks execution, and replies: `"❌ Access Denied: Your account has been banned."` (via callback alert or message).
*   **Status**: PASS ✅

#### Test Case 28: User Unbanned Access Recovery
*   **Input**: Click `✅ Unban User` on a banned user card as Owner. Switch to the unbanned user's account and press catalog buttons.
*   **Expected Behavior**: Database updates status to `'active'`. The unbanned user regains immediate access.
*   **Status**: PASS ✅

#### Test Case 29: User Deletion Cascading Safety Check
*   **Input**: Click `🗑️ Delete User` -> click `Yes, Delete` on a user card as Owner.
*   **Expected Behavior**: Database deletes the user row. Any sales and stock logs created by the user persist but have their `user_id` values set to `NULL` (preserving history). User gets redirected to the accounts list directory.
*   **Status**: PASS ✅

#### Test Case 33: Banned User Reports Blocked
*   **Input**: Send `/owner_report` or tap reports callbacks from a banned user account.
*   **Expected Behavior**: Global middleware blocks execution, outputs ban alert, and restricts dashboard rendering.
*   **Status**: PASS ✅

#### Test Case 34: Product Creation Wizard Flow
*   **Input**: Click `➕ Add New Product` as Stock Manager. Input barcode `885009`, name `Casual Shirt`, category `Clothing`, color `Blue`, size `L`, stock `50`, price `12.50`, and type `-` for photo.
*   **Expected Behavior**: Bot registers the barcode, prints its character length count, advances wizard steps, inserts Casual Shirt into the products table, returns a success confirmation card, displays inline details, and clears the session state.
*   **Status**: PASS ✅

#### Test Case 35: Product Creation Duplicate Barcode Blocked
*   **Input**: Click `➕ Add New Product`. Input barcode `885001` (already exists).
*   **Expected Behavior**: Bot detects duplicate barcode, blocks progress, and alerts: `"⚠️ This barcode already exists for product: Cotton T-Shirt. Please enter a unique barcode..."`
*   **Status**: PASS ✅

#### Test Case 36: Product Creation Wizard Cancelled
*   **Input**: Click `➕ Add New Product`. Type `/cancel`.
*   **Expected Behavior**: Bot cancels wizard, deletes session, and returns to the catalog main menu.
*   **Status**: PASS ✅

#### Test Case 37: Profile Reply Button Hears
*   **Input**: Click Profile button or send text "👤 Profile".
*   **Expected Behavior**: Bot fetches user record, formats and returns profile card containing Name, Username, ID, Role, Status, and registration date.
*   **Status**: PASS ✅

#### Test Case 38: History Reply Button Hears (Seller)
*   **Input**: Click History button or send text "⏳ History" as Seller.
*   **Expected Behavior**: Bot fetches recent sales logs for this seller and formats/displays item names, quantities, totals, and sales times.
*   **Status**: PASS ✅

#### Test Case 39: History Reply Button Hears (Owner)
*   **Input**: Click History button or send text "⏳ History" as Owner.
*   **Expected Behavior**: Bot fetches global sales and stock logs and formats/displays type labels, items, details, operator names, and times.
*   **Status**: PASS ✅

