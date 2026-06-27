# Smart-Stock Inventory Bot - Comprehensive User Guide

This guide provides step-by-step instructions for store owners, managers, stock managers, and sellers to operate the **Smart-Stock Inventory Bot**. 

It outlines the complete user journeys, interaction details, button maps, commands, and corresponding database logs to serve as a complete reference for your team and instructors during the technical audit.

---

## 👥 How the UI Aligns with Stakeholder Requirements

| Stakeholder Persona & Role | Key Problem | Bot Feature Solution |
| :--- | :--- | :--- |
| **Owner & Manager (David)** | Needs real-time stock balances across 3 branches; wants automated stock deductions on sales and interactive user permissions management. | **DB Row Locks & User Manager**: Runs transactional query locks (`SELECT FOR UPDATE`) on sales, and provides a button-driven panel to reassign user roles instantly. |
| **Sellers (Chettra / Sochhiet)** | Manual shelf-counting is too slow; struggles to compile transactions and check stock. | **One-Click Catalog & Sales List**: Product buttons display live stock levels directly on labels, and sales lists allow compiling batches for checkout. |
| **Stock Manager** | Data entry mistakes during manual Stock In/Out; wants low-stock alerts and quick write-offs. | **Zero-Argument Stock Adjustments**: Inline adjustment keyboard adjusts stock instantly (Add/Sub 1, 5, or 10), enters custom amounts, or resets stock to 0. |

---

## 🏗️ System Architecture & Data Flow

When a user taps an inline button, the action propagates through the architecture layers:

```text
  Telegram User (Clicks Button)
               │ (Secure Callback Query Update)
               ▼
      Telegram Bot API
               │ (HTTPS Payload Routing)
               ▼
       Node.js Backend
       - bot.js catches callback query
       - answers query immediately (resolves loader spinner)
       - invokes salesListService.js / stockActionCommand.js / userManagementHandler.js
       - edits current message in-place (keeps chat history clean)
               │ (PostgreSQL Connection Pool)
               ▼
     PostgreSQL Neon Database
       - Executes atomic database commits
       - Triggers SELECT FOR UPDATE row-locking on checkout
       - Writes to products, sales, users, and stock_logs tables
```

---

## 🗺️ Interactive Button Navigation Map

The diagram below maps out how screens and inline keyboards connect to each other:

```text
                     +--------------------------------------+
                     |          Start Menu (/start)         |
                     +--------------------------------------+
                       /         |          |         \
       (View Catalog) /          |          |          \ (View Sale)
                     /     (User Dir)   (Reports)       \
                    v            v          v            v
+-----------------------+  +----------+  +------------------+  +-----------------------+
| Product Catalog Screen|  | User Dir |  |Reports Dashboard |  |  Current Sales List   |
+-----------------------+  +----------+  +------------------+  +-----------------------+
| [Product 1 (Stock)]   |  | [User 1] |  | [🛒 Sales: Daily]|  | [✅ Confirm Checkout]  |
| [Product 2 (Stock)]   |  | [User 2] |  | [🛒 Sales: Weekly]  | [🗑️ Clear Cart]       |
| ...                   |  | ...      |  | [🛒 Sales: Monthly] | [📖 Back to Catalog]  |
| [📋 View Sales / Menu]|  +----------+  | [📦 Stock: Daily]|  | [📋 Main Menu]        |
+-----------------------+                | [📦 Stock: Weekly]  +-----------------------+
        │ (Click Product)                | [📦 Stock: Monthly]
        v                                | [📋 Main Menu]
+-----------------------+                +------------------+
|  Product Detail View  |
+-----------------------+
| [➕ Add to Sale]       |
| [➖ Remove from Sale] |
| [📋 View Sales]       |
| [🔧 Edit Stock]       |
| [✏️ Edit]  [❌ Delete] |
| [🔙 Back to Catalog]  |
+-----------------------+
        │ (Click Edit Stock)
        v
+--------------------------------------+
|        Stock Adjustment Menu         |
+--------------------------------------+
| [➕ Add 1]   [➕ Add 5]   [➕ Add 10] |
| [➖ Sub 1]   [➖ Sub 5]   [➖ Sub 10] |
| [✏️ Custom]  [🧹 Clear Stock (to 0)] |
| [🔙 Back to Product Details]         |
+--------------------------------------+
```

---

## 🛒 1. Seller / Cashier User Flow

The Seller workflow is **100% button-driven**, eliminating typing errors.

### Step 1.1: Start Bot Registration
*   **Action**: Send `/start` to the bot.
*   **System Detail**: Registers your Telegram ID in the database `users` table as a `seller` member by default.
*    *Bot Response (Single combined message with inline options):*
    > 📋 <b>Smart-Stock Inventory</b>
    > ━━━━━━━━━━━━━━━━━━
    > 👤 <b>User:</b> Friend
    > 🏢 <b>Project:</b> Smart-Stock Inventory
    > ━━━━━━━━━━━━━━━━━━
    > 
    > Select an administrative task from the menu below:
    
    *Inline Keyboard:*
    ```text
    +------------------------------------------+
    |            📖 View Catalog               |
    +------------------------------------------+
    |            📋 View Sale List             |
    +------------------------------------------+
    ```

### Step 1.2: Browse Product Catalog
*   **Action**: Click the **📖 View Catalog** button.
*   **System Detail**: Fetches products ordered by category from the database products table.
*   **Bot Response**:
    > 📖 <b>Live Product Catalog</b>
    > 📅 <b>Updated:</b> 27/06/2026, 16:11:00
    > ━━━━━━━━━━━━━━━━━━
    > 
    > 📦 <b>Cotton T-Shirt</b>
    >  ├ 🏷️ Barcode: <code>885001</code> (6 characters)
    >  ├ 📐 Specs: Clothing | White | M
    >  └ 💵 Price: $7.50 | Stock: 24 units (active)
    
    *Inline Keyboard:*
    ```text
    +------------------------------------------+
    |           Cotton T-Shirt (24)            |
    +------------------------------------------+
    |            Denim Jeans (8)               |
    +------------------------------------------+
    |     📋 View Sales      |  📋 Main Menu   |
    +------------------------------------------+
    ```

### Step 1.3: Inspect Product Details (Photo Card)
*   **Action**: Click the **Cotton T-Shirt (24)** button.
*   **Bot Response (Sends Photo with Caption)**:
    *   *Renders a high-definition image of the Cotton T-shirt.*
    > 🔎 **Product Details**
    > 
    > **Product:** Cotton T-Shirt
    > **Barcode:** 885001 (6 characters)
    > **Price:** $7.50
    > **Available Stock:** 24
    
    *Inline Keyboard (Sellers will not see stock adjustment or administrative edit buttons):*
    ```text
    +--------------------+---------------------+
    |   ➕ Add to Sale   |       ➖ Remove     |
    +--------------------+---------------------+
    |                📋 View Sales             |
    +------------------------------------------+
    |             🔙 Back to Catalog           |
    +------------------------------------------+
    ```

### Step 1.4: Review Current Sales List & Checkout
*   **Action**: Click **📋 View Sales** and then click **✅ Confirm Sale / Checkout**.
*   **System Detail**: Records transaction in `sales` and decrements `products` stock levels.
*   **Bot Response (Receipt)**:
    > 🧾 **Sales Checkout Receipt**
    > 
    > **Status:** Transaction Recorded Successfully ✅
    > 
    > • **Cotton T-Shirt** x1 - Recorded ($7.50)
    > 
    > **Total Sales Value:** $7.50

---

## 📦 2. Stock Manager User Flow (Zero-Argument)

Stock managers audit and adjust balances entirely through buttons.

### Step 2.1: Open Stock Adjustment Menu
*   **Action**: Click **🔧 Edit Stock** from the Product Details screen.
*   **Bot Response (Edits Message In-Place)**:
    > 🔧 **Stock Adjustment Menu**
    > 
    > **Product:** Cotton T-Shirt
    > **Barcode:** 885001
    > **Current Stock Balance:** `24` units
    > 
    > Select an adjustment level below to update inventory:
    
    *Inline Keyboard:*
    ```text
    +------------------+-------------------+--------------------+
    |     ➕ Add 1     |     ➕ Add 5      |     ➕ Add 10      |
    +------------------+-------------------+--------------------+
    |     ➖ Sub 1     |     ➖ Sub 5      |     ➖ Sub 10      |
    +------------------+-------------------+--------------------+
    |      ✏️ Custom Amount |  🧹 Clear Stock (Reset to 0)   |
    +------------------+-------------------+--------------------+
    |              🔙 Back to Product Details               |
    +------------------+-------------------+--------------------+
    ```

### Step 2.2: Incremental Stock Adjustments
*   **Action**: Tap **➕ Add 10** or **➖ Sub 5** to adjust.
*   **System Detail**: Instantly executes database transaction commits to increment/decrement `stock_quantity`.

### Step 2.3: Enter Custom Quantities
*   **Action**: Click the **✏️ Custom Amount** button, type a custom number (e.g. `13` or `-7`), and send.
*   **System Detail**: Updates stock count and registers corresponding `stock_in`/`stock_out` audits.

### Step 2.4: Reset/Clear Stock Count to 0
*   **Action**: Click the **🧹 Clear Stock (Reset to 0)** button.
*   **System Detail**: Automatically calculates stock offset, decrements stock count to 0, and records audit note in `stock_logs`.

### Step 2.5: Add New Product to Catalog
*   **Action**: Click the **➕ Add New Product** button in the catalog (or send `/add_product` command).
*   **System Detail**: Initiates conversational product wizard. Prompts user sequentially for: Barcode (uniqueness check & character length display), Product Name, Category, Color, Size, Stock, Price, and Photo. Supports `/cancel` to abort. Generates database insert on completion.

---

## 👑 3. Store Owner & Manager User Flow (User Promotion & Reports)

Owners and managers have full access, including product parameter configuration, deletion, financial reporting, and user administration.

### Step 3.1: Access Reports Dashboard (Multi-Timeframe Sales & Stock logs)
*   **Action**: Click the **📊 View Reports** button on the Main Menu (or send `/owner_report`).
*   **Bot Response**: Renders the multi-timeframe dashboard:
    ```text
    +--------------------+---------------------+---------------------+
    |   🛒 Sales: Daily  |   🛒 Sales: Weekly  |   🛒 Sales: Monthly |
    +--------------------+---------------------+---------------------+
    |   📦 Stock: Daily  |   📦 Stock: Weekly  |   📦 Stock: Monthly |
    +--------------------+---------------------+---------------------+
    |                          📋 Main Menu                          |
    +----------------------------------------------------------------+
    ```
*   **Sales Report Details**: Displays product name, category, quantity sold, total item revenue, and a grand total sum.
    *   *Daily*: Since today's midnight.
    *   *Weekly*: Rolling aggregate over the last 7 days.
    *   *Monthly*: Rolling aggregate over the last 30 days.
*   **Stock Movement Details**: Displays a categorized audit log of all stock actions:
    *   *Stock Intake (Add Stock)*: Restocks and quantity additions.
    *   *Stock Outflow (Sales/Deductions)*: Checkouts and manual stock reductions.
    *   *New Products Registered*: Conversational wizard additions.
    *   *Product Specification Updates*: Modifications to product metadata.
    *   *Deleted Products*: Archive list of deleted products.
    *   *Low Stock Alerts*: Current live items with stock 5 or fewer.

### Step 3.2: Edit Product Specifications
*   **Action**: Click **✏️ Edit** from the product details menu.
*   **Action**: Tap a field (Name, Price, Category, etc.), type the new value (e.g. `9.99` for price), and send.
*   **System Detail**: Runs database `UPDATE` query.

### Step 3.3: Manage Users, Role Promotion, Ban & Account Deletion
*   **Action**: Click **👤 Manage Users** from the Main Menu (or send `/manage_users`).
*   **Bot Response**: Displays a list of all registered users with their current roles in brackets.
*   **Action**: Tap a user (e.g. `LORN David [SELLER]`).
*   **Bot Response**: Renders user details card indicating role and active status, with settings keyboard:
    ```text
    +--------------------+---------------------+
    |     👤 Seller      |   🔧 Stock Manager  |
    +--------------------+---------------------+
    |     👔 Manager     |       👑 Owner      |
    +--------------------+---------------------+
    |     🚫 Ban User    |    🗑️ Delete User   |
    +--------------------+---------------------+
    |              🔙 Back to Directory           |
    +------------------------------------------+
    ```
*   **Promote User Role**: Tap any role button (e.g. `🔧 Stock Manager`) to modify user DB permissions. Bot pops up a success alert.
*   **Ban/Unban User**: Tap **🚫 Ban User** (or **✅ Unban User** if currently banned). This sets user status to `'banned'` globally. Banned users are locked out from catalog browsing and cart checkout immediately.
*   **Delete User**: Tap **🗑️ Delete User** -> confirm by clicking **👍 Yes, Delete**. The user's account row is removed from the database CASCADE safely. Any matching sales logs or stock adjustments remain in the audit logs but have their `user_id` values set to `NULL` (no audit trail deletion).

---

## 📱 Section 3: Bottom Navigation Reply Keyboard

A persistent Reply Keyboard is loaded at the bottom of the user's interface upon running `/start`. This provides instantaneous shortcuts:

### 3.1: [📋 Main Menu] & [📖 View Catalog]
- **Main Menu**: Triggers the welcome inline interface to view dashboard metrics or user lists.
- **View Catalog**: Direct shortcut to print categorized inventory items list and quick-stock edit links.

### 3.2: [⏳ History]
- Returns action logs depending on the user's authorized role:
  - **Sellers**: Displays their recent sales log history (up to last 10 entries) with item name, quantities, and price totals.
  - **Stock Managers**: Displays their recent stock updates history (up to last 10 log rows) including items, restock counts, and action notes.
  - **Owners / Managers / Admins**: Displays a global store audit trail logging all sales and stock changes made by any user.

### 3.3: [👤 Profile]
- Displays active user metadata cards containing: Telegram name, Username handle, Telegram ID, Role permissions (e.g. Owner, Seller), Account Status, and Registration date.

