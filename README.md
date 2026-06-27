# 📊 Smart-Stock Inventory Bot

### 🤖 Live Staging Bot: [@SmartStockInventoryBot](https://t.me/SmartStockInventoryBot)

A premium, conversational Telegram-based inventory management system designed for wholesale shops in Orussey Market, built with Node.js, Telegraf, and PostgreSQL.

Developed for the course Software Project Development (2026).

---

## 🌟 Core Features

- **Dynamic Navigation Layouts**: 
  - Persistent bottom Reply Keyboard for rapid mobile navigation (`📋 Main Menu`, `📖 View Catalog`, `⏳ History`, `👤 Profile`).
  - Single-message interactive Main Menu dashboard card.
- **Conversational Wizard**: Step-by-step product creation flow (`/add_product`) with validation, skipping, and cancelling steps.
- **Barcode character counting**: Display length of barcode inputs (e.g. `885001 (6 characters)`) across views.
- **Role-Based History Logs**: Customized audit trials for Sellers (checkouts), Stock Managers (adjustments), and Owners (global actions).
- **ERP-Grade Stock Audit Reports**:
  - Detailed timeframe lists of **Intakes**, **Outflows**, **New Product registrations**, **Specification Updates**, **Deletions**, and **Low Stock Alerts** (stock quantity <= 5).
- **Exchange rate lookups**: Real-time USD → KHR conversion using `/exchange`.
- **Zero-Crash Staging Compliance**: Complete input parameter sanitization and exception fallback handlers.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Backend Runtime |
| **Telegraf** | Telegram Bot API Framework |
| **PostgreSQL** | Relational Database Storage |
| **Express.js** | API Health Checks |
| **Mocha / Assert** | Technical Audit Test Suite |

---

## 📁 Directory Structure

```text
Inventory_bot/
├── src/
│   ├── bot/
│   │   ├── bot.js            # Telegraf initialization
│   │   └── helpers.js        # Formatting helpers & catalog formatting
│   ├── config/
│   │   └── db.js             # Database connections
│   ├── handlers/             # Telegram interaction controllers
│   │   ├── catalog/          # Live product catalog commands
│   │   ├── exchange/         # Currency API queries
│   │   ├── help/             # Commands guidelines & shortcuts
│   │   ├── menu/             # Keyboard & dashboard controllers
│   │   ├── sell/             # Checkout sales flow
│   │   ├── start/            # Unified entry dashboard card
│   │   └── stock/            # Product Wizards & adjustments
│   ├── models/               # Direct database parameterized queries
│   │   ├── productModel.js
│   │   ├── userModel.js
│   │   ├── Schema.sql
│   │   └── seed.sql
│   ├── services/             # Business rules & report calculations
│   │   ├── productService.js
│   │   ├── stockService.js
│   │   ├── salesService.js
│   │   └── userService.js
│   ├── app.js
│   └── server.js
├── tests/                    # Zero-dependency Technical Staging Audit Suite
│   ├── mocks.js              # Mock query intercepts
│   ├── unit.test.js          # Unit tests
│   └── run.js                # Test runner
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 14+
- PostgreSQL database
- Telegram bot token (from [@BotFather](https://t.me/BotFather))

### 1. Clone & Install
```bash
git clone <repository-url>
cd Inventory_bot
npm install
```

### 2. Configure Environment
Create a `.env` file at the root:
```env
TELEGRAM_BOT_TOKEN=your_token_here
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=verify-full
PORT=3000
```

### 3. Initialize Database Tables
```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
psql "$DATABASE_URL" -f src/models/seed.sql
```

### 4. Run the Application
Development server (with automatic restarts):
```bash
npm run dev
```
Production start:
```bash
npm start
```

---

## 🧪 Running Staging Test Suite

The repository contains a complete local mock test suite to audit stability and verify all conversational wizards, negative validations, role-based controls, and database aggregate helper behaviors:
```bash
npm test
```

---

## 🤖 Telegram Interface Commands

### General Commands
- `/start` — Unified entry card with role-specific menu actions.
- `/help` — Guidelines on command usages and shortcuts list.
- `/exchange` — Get the current USD to KHR currency exchange rate.

### Catalog & Sales (Sellers/Managers)
- `/view_catalog` — List all products with specs, stock quantities, and details.
- `/check_stock [barcode]` — Inspect inventory details of a specific barcode.
- `/sell [barcode] [qty]` — Deduct stock from the catalog for a client purchase.
- `/update_stock [barcode] [qty]` — Direct stock increment or reduction.

### Product Creation & Management (Owners/Stock Managers)
- `/add_product` — Launch the conversational wizard to add a new catalog item.
- `/owner_report` — View timeframe daily, weekly, or monthly Sales and Stock Audit logs.
- `/manage_users` — View user profiles, ban/unban members, or promote roles.

---

## 📄 License
MIT License
