# Smart-Stock Inventory Bot - Comprehensive User Guide

This guide provides step-by-step instructions for store owners, sales staff, and stock managers to operate the **Smart-Stock Inventory Bot**. 

It outlines the complete user journeys, interaction details, button maps, commands, and corresponding database logs to serve as a complete reference for your team and instructors during the technical audit.

---

## 👥 How the UI Aligns with Stakeholder Requirements

| Stakeholder Persona & Role | Key Problem | Bot Feature Solution |
| :--- | :--- | :--- |
| **Owner (David)** | Needs real-time stock balances across 3 branches; wants automated stock deductions on sales. | **Database Transaction Locks**: Clicking "Confirm Sale" runs transactional queries to immediately update product balances and logs. |
| **Seller 1 & 2 (Chettra / Sochhiet)** | Manual shelf-counting is too slow; struggles to track stock and sales records. | **One-Click Catalog & Sales List**: Product buttons display live stock levels directly in the label, and sales lists allow compiling batches. |
| **Stock Manager** | Data entry mistakes during manual Stock In/Out; wants low-stock alerts. | **Zero-Argument Stock Adjustments**: Inline adjustment keyboard adjusts stock instantly (Add/Sub 1, 5, or 10) and logs records. |

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
       - invokes salesListService.js / stockActionCommand.js
       - edits current message in-place (keeps chat history clean)
               │ (PostgreSQL Connection Pool)
               ▼
     PostgreSQL Neon Database
       - Executes atomic database commits
       - Triggers SELECT FOR UPDATE row-locking on checkout
       - Writes to products, sales, and stock_logs tables
```

---

## 🗺️ Interactive Button Navigation Map

The diagram below maps out how screens and inline keyboards connect to each other:

```text
               +----------------------------------+
               |        Start Menu (/start)       |
               +----------------------------------+
                 /                              \
  (View Catalog)/                                \(View Current Sale)
               v                                  v
+-----------------------------+     +-----------------------------+
|    Product Catalog Screen   |     |      Current Sales List     |
+-----------------------------+     +-----------------------------+
| [Product 1 (Stock)]         |     | [✅ Confirm Sale / Checkout]|
| [Product 2 (Stock)]         |     | [🗑️ Clear List]             |
| ...                         |     | [📖 Back to Catalog]        |
| [📋 View Current Sale]      |     | [📋 Main Menu]              |
+-----------------------------+     +-----------------------------+
               | (Click Product)
               v
+-----------------------------+
|     Product Detail View     |
+-----------------------------+
| [➕ Add to Sale]             |
| [➖ Remove from Sale]       |
| [📋 View Sales List]        |
| [🔧 Adjust Stock (Intake)]   |
| [✏️ Edit Product (Admin)]    |
| [❌ Delete Product (Admin)]  |
| [🔙 Back to Catalog]        |
+-----------------------------+
               | (Click Adjust Stock)
               v
+-----------------------------+
|    Stock Adjustment Menu    |
+-----------------------------+
| [➕ Add 1]  [➕ Add 5]  [➕ Add 10] |
| [➖ Sub 1]  [➖ Sub 5]  [➖ Sub 10] |
| [🔙 Back to Product Details]|
+-----------------------------+
```

---

## 🛒 1. Seller / Cashier User Flow

The Seller workflow is **100% button-driven**, eliminating typing errors.

### Step 1.1: Start Bot Registration
*   **Action**: Send `/start` to the bot.
*   **System Detail**: Registers your Telegram ID in the database `users` table as a `staff` member.
*   **Bot Response**:
    > Welcome back, Friend! 👋
    > 
    > Thank you for using Smart Inventory Stock Bot! We're happy to see you again.
    
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
*   **System Detail**: Fetches products ordered by category from the database.
*   **Bot Response**:
    > 📖 **Live Product Catalog**
    > Updated from database: 27/06/2026, 16:11:00
    
    *Inline Keyboard:*
    ```text
    +------------------------------------------+
    |           Cotton T-Shirt (24)            |
    +------------------------------------------+
    |            Denim Jeans (8)               |
    +------------------------------------------+
    |          📋 View Current Sale            |
    +------------------------------------------+
    ```

### Step 1.3: Inspect Product Details (Photo Card)
*   **Action**: Click the **Cotton T-Shirt (24)** button.
*   **Bot Response (Sends Photo with Caption)**:
    *   *Renders a high-definition image of a Cotton T-shirt.*
    > 🔎 **Product Details**
    > 
    > **Product:** Cotton T-Shirt
    > **Barcode:** 885001
    > **Price:** $7.50
    > **Available Stock:** 24
    
    *Inline Keyboard (Administrative edit/delete buttons display for managers/owners only):*
    ```text
    +--------------------+---------------------+
    |   ➕ Add to Sale   |       ➖ Remove     |
    +--------------------+---------------------+
    |             📋 View Sales List           |
    +------------------------------------------+
    |      🔧 Adjust Stock (Intake/Outtake)    |
    +------------------------------------------+
    |      ✏️ Edit Product  |  ❌ Delete      |
    +------------------------------------------+
    |             🔙 Back to Catalog           |
    +------------------------------------------+
    ```

### Step 1.4: Review Current Sales List & Checkout
*   **Action**: Click **📋 View Sales List** and then click **✅ Confirm Sale / Checkout**.
*   **System Detail**: Records the sale and decrements `products` stock level.
*   **Bot Response (Receipt)**:
    > 🧾 **Sales Checkout Receipt**
    > 
    > **Status:** Transaction Recorded Successfully ✅
    > 
    > • **Cotton T-Shirt** x1 - Recorded ($7.50)

---

## 📦 2. Stock Manager User Flow (Zero-Argument)

The Stock Manager audits, updates stock (Stock In/Out), and adjust balances entirely through buttons.

### Step 2.1: Open Stock Adjustment Menu
*   **Action**: Click **🔧 Adjust Stock (Intake/Outtake)** from the Product Details screen.
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
    |              🔙 Back to Product Details               |
    +------------------+-------------------+--------------------+
    ```

### Step 2.2: Stock Intake & Reductions
*   **Action**: Tap **➕ Add 10** or **➖ Sub 5** to increment/decrement.
*   **System Detail**: Modifies stock count directly in the database.

### Step 2.3: Enter Custom Quantities (Custom Intake / Write-offs)
*   **Action**: Click the **✏️ Enter Custom Amount** button, type a custom number (e.g. `13` or `-7`), and send.
*   **System Detail**: Database transaction registers the change and updates balances.

### Step 2.4: Edit Product Specifications
*   **Action**: Click **✏️ Edit Product** from the product details menu.
*   **Bot Response**: Renders sub-menu options: Name, Price, Category, Color, Size, Image URL.
*   **Action**: Tap **🏷️ Name**, type `Super Cotton T-Shirt`, and press send.
*   **System Detail**: Modifies the matching row in `products` and outputs a confirmation.

### Step 2.5: Delete Product Permanently
*   **Action**: Click **❌ Delete Product**.
*   **Bot Response**: Prompts with confirmation: *"Are you sure you want to permanently delete Cotton T-Shirt?"*
*   **Action**: Click **Yes, Delete**.
*   **System Detail**: Runs a `DELETE` query on the `products` table, clearing it and its logs, and returns to the catalog.

---

## 👑 3. Store Owner User Flow (Zero-Argument & Secure Reports)

The Owner monitors inventory, daily sales, and receives notifications.

### Step 3.1: Check Specific Product Stock
*   The Owner browses the catalog using **📖 View Catalog** and clicks the target product to check stock levels. Manual typing is not required.

### Step 3.2: Retrieve Daily Sales Report
*   **Action**: Click the **📊 View Daily Report** button on the Main Menu.
*   **Bot Response**: Displays the aggregated today's category sales and revenue.
