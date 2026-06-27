# System Architecture & Database Design
Smart-Stock Inventory Bot — Week 11 Updates (Sprint 6 Completion & Staging Audit Preparation)

---

# 1. System Architecture Layers

The Smart-Stock Inventory Bot is built on a clean, layered architecture separating client presentation, routing controllers, business rule execution, payload formatting, and data persistence.

```text
Admin / Seller (Telegram Client)
             │
             ▼
      Telegram Bot API
             │
             ▼
     Controller Layer (src/handlers/)
             │
             ▼
Business Logic Layer (src/services/ & src/models/)
   ├── User Service (userService.js - Profile, Roles & Ban Checks)
   ├── Product Service (productService.js - Catalog, Wizard & Stock Reports)
   ├── Sales Service (salesService.js - Sales Reports & Transaction Processing)
   ├── Sales List Service (salesListService.js - Cart & Checkout Manager)
   ├── Stock Service (stockService.js - Stock Action Coordinator)
   └── API Service (apiService.js - External Asset Integrator)
             │
             ▼
     API Payload Layer (Request/Response Hooks)
             │
             ▼
 Database Layer (PostgreSQL - Neon DB & Connection Pool)
```

---

## 1.1 Components & Modules Used

| Component | Layer | Purpose |
| :--- | :--- | :--- |
| **Telegram App** | Presentation | User Interface for Sellers, Managers, and Owners. |
| **Telegraf Framework** | Controller | Bot router catching commands, text inputs, and callback buttons. |
| **Node.js + Express** | Web Server | Backend server host, handling routing, services, and health checks. |
| **Neon PostgreSQL** | Database | Serverless Cloud PostgreSQL storing transactional tables. |
| **Render** | Hosting | Hosts the production backend application under continuous integration. |

---

# 2. API Payload Hooking

API Payload Hooking manages data exchange, validation, and format mappings between the Telegram Bot API controller hooks and the underlying services.

### Example Request Hook (Checkout Cart Payload)
```json
{
  "telegramId": 123456789,
  "items": [
    { "barcode": "885001", "quantity": 2 },
    { "barcode": "885002", "quantity": 1 }
  ]
}
```

### Example Response Hook (Checkout Receipt Payload)
```json
{
  "status": "success",
  "message": "Sale recorded successfully",
  "receipt": {
    "transactionId": 45,
    "total": 45.00,
    "soldAt": "2026-06-27T21:26:50Z"
  }
}
```

### Data Flow Execution
```text
Telegram User Event
         │
         ▼
Payload Extraction (Callback Data e.g., 'stock:885001')
         │
         ▼
Controller Validation (Role check, query resolution)
         │
         ▼
Business Service Invocation (db transaction, stock reduction)
         │
         ▼
Payload Response Formatter (HTML text builder)
         │
         ▼
Telegram Bot Reply (Output to user)
```

---

# 3. Business Logic Integration

The Business Logic Layer coordinates constraints, rules, and logic execution independently of the Telegraf message routing context:

*   **User Service (`userService.js`)**:
    *   Verifies incoming Telegram user profiles and registers accounts.
    *   Determines authorization roles (`owner`, `manager`, `stock-manager`, `seller`).
    *   Applies the global Ban/Unban middleware block before execution of any handler.
    *   Manages staff promotions, demotions, and deletion in the database.
*   **Product Service (`productService.js` & `productModel.js`)**:
    *   Executes conversational wizard queries to add new items (validating name, category, pricing, and image URLs).
    *   Updates specific fields (name, price, category, status) of catalog products.
    *   Triggers incremental stock movements (`stock_in` and `stock_out`).
    *   Deletes products from the catalog.
    *   Generates stock movement audit reports for managers.
*   **Sales Service (`salesService.js`)**:
    *   Validates stock availability and records transaction checkouts.
    *   Queries `sales` table to aggregate sales data.
    *   Generates daily, weekly, or monthly sales reports.
*   **Sales List Service (`salesListService.js`)**:
    *   Aggregates in-memory seller carts per user.
    *   Validates available stock quantities prior to checking out.
    *   Applies `SELECT FOR UPDATE` locks to isolate checkouts from double-selling conflicts.
*   **Stock Service (`stockService.js`)**:
    *   Coordinates quick quantity adjustments (`+1`, `+5`, `+10`, `-1`, `-5`, `-10`).
    *   Manages custom text stock input and stock clears.
*   **API Service (`apiService.js`)**:
    *   Handles external API calls (e.g. fetching dynamic visual assets/images).

---

# 4. Synchronous Features (Real-Time Requests)

Synchronous operations block execution until the database transaction completes, providing immediate confirmation to the user.

```text
User Request ──► Controller ──► Transactional DB Commit ──► Immediate Bot Reply
```

### Features Requiring Instant Synchronization
*   **Authentication & Role Checking**: User verification occurs inline before processing commands.
*   **Catalog Browsing**: Catalog fetching returns active items with up-to-date stocks instantly.
*   **Cart Audits**: Carts check quantity parameters dynamically on button taps (`[➕ Add]`, `[➖ Sub]`).
*   **Record Sales / Checkout**: Sales transactions are recorded synchronously using database locks to prevent stock issues.
*   **Stock Inquiries**: Querying a barcode manually or via inline detail lookup requires direct database responses.

---

# 5. Asynchronous Features (Background Tasks)

Asynchronous operations execute behind the scenes, dispatching notifications, updating cache indexes, or performing cleanup operations without blocking user interactions.

```text
User Request ──► Queue Job/Event ──► User Continues ──► Background Job ──► Bot Alert
```

### Non-blocking Background Tasks
*   **Low Stock Alerts**: Automatic database triggers detect when inventory counts drop below threshold limits and fire Telegram alert logs.
*   **Audit Logging**: Inserts audit rows into `stock_logs` for historical records alongside inventory changes.
*   **Report Summarizations**: Compiles large rolling data blocks without freezing the UI.
*   **Media Resolvers**: Retrieves images from Unsplash APIs asynchronously when showing details cards.

---

# 6. Complete System Flow

```text
                 Telegram Command / Button Click
                              │
                              ▼
                   Role & Ban Authentication
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                [ Owner ]           [ Seller ]
                    │                   │
           ┌────────┴────────┐          ├──────────────────┐
           ▼                 ▼          ▼                  ▼
     Manage Users     View Reports   View Catalog    View Sales Cart
           │                 │          │                  │
           ▼                 ▼          ▼                  ▼
      User Service    Report Service ◄──┴──────────► Sales Service
           │                 │                             │
           └─────────────────┼─────────┬───────────────────┘
                             │         │
                             ▼         ▼
                         Inventory Database (Neon)
                             │
                             ▼
                Background Worker Integrations
                     ├── Low Stock Alerts
                     └── Audit Log Records
```

---

# 7. Database Design

The database uses PostgreSQL (Neon) with explicit indices and constraints to maintain catalog consistency.

## 7.1 Entity Relationship Diagram (ERD)

### USERS
```sql
users
-----
id SERIAL (PK)
telegram_id BIGINT (UNIQUE, NOT NULL)
username VARCHAR(100)
first_name VARCHAR(100)
last_name VARCHAR(100)
role VARCHAR(30) (NOT NULL, DEFAULT 'seller')
status VARCHAR(30) (NOT NULL, DEFAULT 'active')
created_at TIMESTAMP (NOT NULL, DEFAULT NOW())
updated_at TIMESTAMP (NOT NULL, DEFAULT NOW())
```

### PRODUCTS
```sql
products
--------
id SERIAL (PK)
barcode VARCHAR(100) (UNIQUE, NOT NULL)
product_name VARCHAR(255) (NOT NULL)
category VARCHAR(100)
color VARCHAR(80)
size VARCHAR(80)
stock_quantity INTEGER (NOT NULL, CHECK >= 0, DEFAULT 0)
price NUMERIC(10, 2) (NOT NULL, CHECK >= 0, DEFAULT 0)
status VARCHAR(30) (NOT NULL, DEFAULT 'active')
image_url VARCHAR(500)
created_at TIMESTAMP (NOT NULL, DEFAULT NOW())
updated_at TIMESTAMP (NOT NULL, DEFAULT NOW())
```

### SALES
```sql
sales
-----
id SERIAL (PK)
product_id INTEGER (FK, REFERENCES products(id), ON DELETE RESTRICT)
user_id INTEGER (FK, REFERENCES users(id), ON DELETE SET NULL)
quantity INTEGER (NOT NULL, CHECK > 0)
total_price NUMERIC(10, 2) (NOT NULL, CHECK >= 0)
sold_at TIMESTAMP (NOT NULL, DEFAULT NOW())
```

### STOCK_LOGS
```sql
stock_logs
----------
id SERIAL (PK)
product_id INTEGER (FK, REFERENCES products(id), ON DELETE CASCADE)
user_id INTEGER (FK, REFERENCES users(id), ON DELETE SET NULL)
action_type VARCHAR(30) (NOT NULL) -- 'stock_in', 'stock_out', 'sale'
quantity_changed INTEGER (NOT NULL)
note TEXT
created_at TIMESTAMP (NOT NULL, DEFAULT NOW())
```

### NOTIFICATIONS
```sql
notifications
-------------
id SERIAL (PK)
product_id INTEGER (FK, REFERENCES products(id), ON DELETE CASCADE)
message TEXT (NOT NULL)
status VARCHAR(30) (NOT NULL, DEFAULT 'unread')
created_at TIMESTAMP (NOT NULL, DEFAULT NOW())
```

## 7.2 Database Relationships Diagram
```text
  ┌───────────────┐
  │     USERS     │
  └───────┬───────┘
          │
          │ 1 : N
          ▼
  ┌───────────────┐
  │     SALES     │
  └───────▲───────┘
          │
          │ N : 1
          ▼
  ┌───────────────┐
  │   PRODUCTS    │
  └───────┬───────┘
          │
          ├─────────────┐
          │             │
          ▼             ▼
  ┌───────────────┐  ┌───────────────┐
  │  STOCK_LOGS   │  │ NOTIFICATIONS │
  └───────▲───────┘  └───────▲───────┘
          │                  │
          └────── USERS ─────┘
```

---

# 8. External API Hooking

*   **Telegram Bot API**: Handles real-time polling messages, triggers callback buttons, answers loading queries, and posts admin logs.
*   **Neon Cloud DB Hooks**: Synchronizes schema updates and hosts index performance profiles.
*   **Future Extensions**:
    *   **Currency Exchange API**: Real-time conversion of invoice prices to multiple currencies.
    *   **Cloud Media Storage API**: Persisting product photos on cloud storage buckets.
    *   **Notification Dispatchers**: Forwarding high-priority logs to external emails or SMS platforms.

---

# 9. Architecture Benefits & Status

*   **Separation of Concerns**: Clearly distinguishes message capture, data modeling, and business logic execution.
*   **Scale Ready**: Integrates easily with cloud databases, external exchange systems, and background logging processes.
*   **Reliability**: Outfitted with robust crash fallbacks and locks that avoid double-selling issues.
*   **Optimized Performance**: Minimizes user wait times by running slow computations asynchronously.

### Development Team & Status
*   **LORN David** — Project Manager & Wiki Compiler
*   **Udom Vathana** — Lead Developer (Bot Navigation, Cart & Callbacks)
*   **Lao Panha** — Backend & Database Developer (Transactions & Security)
*   **Meuon Chettra** — API Integrations & QA Tester
*   **Yeuon Sochiet** — UI Designer & Project Board Coordinator

### Staging Verification Status
*   [x] **Layered Architecture**: Complete code separation between controllers and business services.
*   [x] **Database Constraints**: All table validation constraints (FKs, CHECKs) successfully defined.
*   [x] **Sync & Async Flows**: Synchronous checkout validation and asynchronous low stock logging implemented.
*   [x] **Test Verification**: Zero-crash compliance and role validations confirmed through the 36-case test matrix.
