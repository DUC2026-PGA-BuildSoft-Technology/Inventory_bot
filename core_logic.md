# Core Logic: Smart-Stock Inventory Bot

### Objective

Design a scalable inventory management system that integrates Business Logic Services, API Payload Processing, Database Operations, and Background Tasks using both Synchronous and Asynchronous communication.

---

# 1. System Architecture

```text
Admin / Seller
       │
       ▼
Telegram Bot
       │
       ▼
Controller Layer (src/handlers/)
       │
       ▼
Business Logic Layer (src/services/ & src/models/)
       ├── User Service (userService.js)
       ├── Product Service (productService.js)
       ├── Sales Service (salesService.js)
       ├── Sales List Service (salesListService.js)
       └── Stock Service (stockService.js)
       │
       ▼
API Payload Layer (Request/Response validation)
       │
       ▼
Database Layer (db.js Connection Pool)
       │
       ▼
Neon PostgreSQL
```

---

# 2. API Payload Hooking

API Payload Hooking is the process of receiving, validating, processing, and sending data between system components.

### Example Payload

#### Request
```json
{
  "telegramId": 123456789,
  "action": "sale_add",
  "barcode": "885001"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Item added to cart successfully"
}
```

#### Flow
```text
Telegram User Event (Button click)
      │
      ▼
Payload Request ('sale_add:885001')
      │
      ▼
Controller (bot.action router)
      │
      ▼
Business Service (salesListService.js cart update)
      │
      ▼
Database (stock verification)
      │
      ▼
Payload Response (UI state update & answerCbQuery)
```

---

# 3. Business Logic Integration

The Business Logic Layer contains all business rules and system operations.

### User Service (`userService.js`)
*   **User Validation**: Registers user records and authenticates active staff profiles.
*   **Role Validation**: Verifies authorization levels (`owner`, `manager`, `stock-manager`, `seller`).
*   **Ban Interception**: Intercepts actions to block banned accounts.

### Product Service (`productService.js` & `productModel.js`)
*   **Add Product**: Triggers the conversational creation wizard.
*   **Update Product**: Enables inline specification edits.
*   **Check Stock**: Direct barcode and database checks.
*   **Reduce Stock**: Lowers stock balances on checkouts.

### Sales Service (`salesService.js` & `salesListService.js`)
*   **Record Sales**: Writes transaction checkouts to `sales` table.
*   **Calculate Total Sales**: Aggregates money amounts and item totals.

### Stock Service (`stockService.js`)
*   **Manage Stock**: Executes quantity increments/reductions.
*   **Audit Logging**: Records movements directly into `stock_logs`.

---

# 4. Synchronous Features

Synchronous operations require an immediate response from the database to keep data consistent.

#### Flow
```text
User Request ──► Process Request (DB Transaction) ──► Immediate Response
```

#### Features

*   **Owner / Manager / Stock Manager**:
    *   Authentication & Role Verification (Middleware validation).
    *   Add Product (Wizard form responses).
    *   Update Product Specs (Field edits).
    *   Delete Product (Deletion execution).
    *   Check Stock (Real-time barcode query).
*   **Seller**:
    *   Search Product (Detail cards catalog).
    *   Check Stock (Live button labels e.g. `Cotton T-Shirt (24)`).
    *   Cart Management (Tapping inline `[➕ Add]` / `[➖ Sub]` buttons).
    *   Record Sale (Synchronous transaction commit using `SELECT FOR UPDATE` locks).

Reason:
Users need real-time validation (e.g. stock level confirmation and permission security) before the bot updates the Telegram interface.

---

# 5. Asynchronous Features

Asynchronous operations run in the background to ensure the interface remains responsive without freezing.

#### Flow
```text
User Request ──► Create Background Job ──► Continue Working ──► Notification Result
```

#### Features

*   **Reports**:
    *   Daily, Weekly, and Monthly stock movement log compiles.
    *   Dynamic visual categories loading.
*   **Notifications**:
    *   Low Stock Alert (Sent automatically when inventory drops below 5 units).
    *   Ban Alerts (System-wide blocking notifications).
    *   Action logging alerts.
*   **Background Processing**:
    *   Stock Audit Log Inserts (Adding rows to `stock_logs` asynchronously).
    *   Category Image Resolutions (Fetching placeholders from Unsplash APIs).

Reason:
These tasks take longer (e.g., API requests or table calculations) and should not block the user interface.

---

# 6. Complete System Flow

```text
Admin / Seller
       │
       ▼
Telegram Bot
       │
       ▼
Authentication (Ban Interceptor)
       │
       ▼
Role Validation (Owner vs. Manager vs. Seller)
       │
 ┌─────┴─────┐
 │           │
 ▼           ▼
Admin      Seller
 │           │
 ▼           ▼
Manage     Sales (Cart Checkout)
Products     │
 │           │
 └─────┬─────┘
       │
       ▼
Inventory Service (productService.js)
       │
       ▼
API Payload Layer
       │
       ▼
Neon PostgreSQL (sales, products, users tables)
       │
       ▼
Response to User

Background Services
       │
       ├── Low Stock Alert Notifications
       └── Audit Logging (stock_logs inserts)
```

---

# 7. External API Hooking

*   **Telegram Bot API**: Receives commands, captures button callbacks, and sends notifications.
*   **Neon PostgreSQL**: Stores products, sales, users, notifications, and stock logs.
*   **Future Integrations**:
    *   Currency Exchange API (Real-time price conversions).
    *   Email/SMS Notification API.
    *   Cloud Storage API (For physical invoice receipts).

---

# 8. Benefits

*   **Clean System Architecture**: Strict separation between controller routes and backend business services.
*   **Separation of Concerns**: Handler routers purely format Telegram messages, leaving logic to dedicated services.
*   **Scalable Design**: Prepared to support multi-branch extensions and future microservices.
*   **Fast User Experience**: Systematically answers inline callbacks to eliminate hanging loader spinners.
*   **Zero-Crash Stability**: Outfitted with a global error handler preventing runtime server exceptions.
