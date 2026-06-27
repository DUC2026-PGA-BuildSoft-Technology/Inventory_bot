# System Architecture & Database Design
Smart-Stock Inventory Bot — Week 10 Updates (Sprint 5 Completion)

---

# 1. Smart-Stock Inventory Bot Architecture

```text
+-------------------+
| Telegram User     |
| (Owner / Staff)   |
+-------------------+
          |
          v
+-------------------+
| Telegram Bot API  |
+-------------------+
          |
          v
+-------------------+
| Node.js Backend   |
| Express + Telegraf|
+-------------------+
          |
          v
+-------------------+
| PostgreSQL DB     |
| Neon Database     |
+-------------------+
          |
          v
+-------------------+
| Render Hosting    |
+-------------------+
```

---

## 1.1 System Workflow (Zero-Argument Cart Navigation)

For Week 10, typed argument inputs (e.g. `/sell 885001 2`) are replaced by an inline keyboard system. The bot workflow is now 100% button-driven:

```text
User clicks "View Catalog" button or sends /view_catalog
                         ↓
Bot displays Catalog Message with inline button for each product
                         ↓
User clicks a product button (e.g., "Cotton T-Shirt (24)")
                         ↓
Bot resolves loading spinner & updates message to show product details
with actions: [➕ Add to Cart] [➖ Remove from Cart] [🛒 View Cart]
                         ↓
User clicks [➕ Add to Cart] (item quantity increments in-memory)
                         ↓
User clicks [🛒 View Cart] (shows subtotals, item lists, and total price)
                         ↓
User clicks [✅ Checkout / Record Sale]
                         ↓
Node.js runs transactional query sequence:
1. Decrements stock in products table
2. Inserts sale records into sales table
3. Appends transaction audit to stock_logs table
                         ↓
Bot replies with Receipt & clears the cart list
```

---

## 1.2 Components Used

| Component | Purpose |
| :--- | :--- |
| **Telegram** | Client-side user interface |
| **BotFather** | Telegram bot registration & command setup |
| **Telegraf** | Telegram bot framework for Node.js |
| **Node.js** | Backend JavaScript runtime environment |
| **Express.js** | Health check endpoints and routing |
| **PostgreSQL** | Relational storage for users, catalog, logs, and sales |
| **Neon DB** | Serverless Cloud PostgreSQL provider |
| **Render** | Production application hosting |
| **GitHub** | Version control, issue tracking, and Wiki documentation |

---

## 1.3 Architecture Benefits

- **Zero-Argument UX**: Prevents human typo errors when inputting barcodes or quantities manually.
- **Immediate Callback Resolution**: Minimizes interface latency, clearing loading spinners on button clicks.
- **Transactional Consistency**: Prevents double-selling items using `SELECT FOR UPDATE` query locks.
- **Audit Logging**: Keeps database history of every product, sale, and stock log edit.
- **Scalable Deployment**: Supported by serverless DB storage and cloud hosting.

---

# 2. Database Design

The database uses PostgreSQL (Neon) with explicit indices and constraints to maintain catalog consistency.

---

## 2.1 Entity Relationship Diagram (ERD)

### USERS
Stores user accounts registered via Telegram.
```sql
users
-----
id (PK)
telegram_id (UNIQUE)
username
first_name
last_name
role
created_at
updated_at
```

---

### PRODUCTS
Stores inventory items, stock, prices, and status.
```sql
products
--------
id (PK)
barcode (UNIQUE)
product_name
category
color
size
stock_quantity (CHECK >= 0)
price (CHECK >= 0)
status
created_at
updated_at
```

---

### SALES
Records transaction details of checkouts.
```sql
sales
-----
id (PK)
product_id (FK)
user_id (FK)
quantity (CHECK > 0)
total_price (CHECK >= 0)
sold_at
```

---

### STOCK_LOGS
Audit trail records tracking all stock movements.
```sql
stock_logs
----------
id (PK)
product_id (FK)
user_id (FK)
action_type ('stock_in', 'stock_out', 'sale')
quantity_changed
note
created_at
```

---

### NOTIFICATIONS
Low stock indicators written automatically when product quantity falls below threshold.
```sql
notifications
-------------
id (PK)
product_id (FK)
message
status ('unread', 'read')
created_at
```

---

## 2.2 Relationship Diagram

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

## 2.3 Core Telegram Workflow Commands

| Command | Action Mode | Week 10 Enhancement |
| :--- | :--- | :--- |
| `/start` | Welcome Menu | Displays inline buttons: Catalog, Cart, Help |
| `/help` | Explanations | Lists bot capabilities |
| `/view_catalog` | Catalog Listing | Renders inline product selection keyboard |
| `/check_stock` | Manual Check | Supported for barcodes (manual query fallback) |
| `/sell` | Manual Sale | Supported for staff (manual input fallback) |
| `/update_stock` | Manual Audits | Supported for staff (manual input fallback) |

---

## 2.4 Future Improvements

- Barcode Scanner Integration (Camera scanner via Telegram WebApp)
- Multi-Branch Inventory Synchronization
- Daily/Weekly Automated Sales Summary Reports (PDF/Excel exports)
- Advanced Web Dashboard Analytics for store owners

---

## 2.5 Development Team

| Name | Role |
| :--- | :--- |
| **LORN David** | Project Manager & Wiki Compiler |
| **Udom Vathana** | Lead Developer (Bot Navigation, Cart & Callbacks) |
| **Lao Panha** | Backend & Database Developer (Transactions & Security) |
| **Meuon Chettra** | API Integrations & QA Tester |
| **Yeuon Sochiet** | UI Designer & Project Board Coordinator |

---

## 2.6 Current Project Status (Week 10 Completion)

- [x] **System Architecture**: Optimized to support an inline button workflow.
- [x] **Database Design**: Implemented transaction locks (`SELECT FOR UPDATE`) to prevent race conditions.
- [x] **Telegraf Bot Callback**: Configured to answer queries instantly, resolving loading spinner delays.
- [x] **Elimination of Typed Arguments**: Added cart service for a checkout experience driven entirely by buttons.
- [x] **GitHub Wiki & Agile Board**: Initialized the User Guide pages and synced Sprint 5 cards to developers.
