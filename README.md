# 📦 Smart-Stock Inventory Bot

### 🤖 Live Staging Bot: [@SmartStockInventoryBot](https://t.me/SmartStockInventoryBot)

Smart-Stock is a full-stack inventory management system that combines a **Telegram Bot**, a **Responsive Web Dashboard**, **Cloudinary-powered image management**, and a **PostgreSQL (Neon)** backend into one integrated solution.

Developed for the course Software Project Development (2026), it is designed for wholesale shops in Orussey Market to efficiently manage products, inventory, sales, and administrators.

---

<a id="top"></a>

# 📑 Table of Contents

* [📖 Project Summary](#-project-summary)
* [✨ Key Features](#-key-features)
* [🛠 Technology Stack](#-technology-stack)
* [🏗 Architecture Overview](#-architecture-overview)
* [📂 Repository Structure](#-repository-structure)
* [📋 Requirements](#-requirements)
* [⚙ Environment Configuration](#-environment-configuration)
* [🚀 Installation](#-installation)
* [▶ Running the Project](#-running-the-project)
* [🧪 Running Staging Test Suite](#-running-staging-test-suite)
* [🌐 Web Dashboard Features](#-web-dashboard-features)
* [🤖 Telegram Bot Commands](#-telegram-bot-commands)
* [📝 Development Notes](#-development-notes)
* [⭐ Professional Project Highlights](#-professional-project-highlights)
* [📄 License](#-license)

---

# 📖 Project Summary

Smart-Stock integrates several technologies into a complete inventory platform:
* **Telegram Bot** for mobile, conversational access.
* **Responsive Web Dashboard** for centralized administrative operations.
* **Cloudinary** for image storage and management.
* **PostgreSQL (Neon Database)** for relational data persistence.

[⬆ Back to Top](#top)

---

# ✨ Key Features

### 📦 Product & Stock Management
* **Conversational Wizard**: Step-by-step product creation flow (`/add_product`) with validation, skipping, and cancelling steps.
* **Barcode Character Counting**: Display length of barcode inputs (e.g. `885001 (6 characters)`) across views.
* **Inventory Control**: Update stock quantities, manage statuses (Active, Low Stock, Out of Stock). Low Stock is defined as stock quantity <= 5.
* **Cloudinary Image Upload**: Upload and display product images on the web dashboard.

### 💰 Sales & Reporting
* **Sales Recording**: Log sales transactions, which automatically deducts quantity from inventory.
* **Role-Based History Logs**: Customized audit trails for Sellers (checkouts), Stock Managers (adjustments), and Owners (global actions).
* **ERP-Grade Stock Audit Reports**: Timeframe lists of Intakes, Outflows, New Product registrations, Specification Updates, Deletions, and Low Stock Alerts.

### 🤖 telegram Interface & UX
* **Dynamic Navigation Layouts**: Persistent bottom Reply Keyboard (`📋 Main Menu`, `📖 View Catalog`, `⏳ History`, `👤 Profile`).
* **Single-Message Interactive Dashboards**: Main Menu dashboard card for clean navigation.
* **Exchange Rate Lookups**: Real-time USD → KHR conversion using `/exchange`.
* **Zero-Crash Staging Compliance**: Complete input parameter sanitization and exception fallback handlers.

[⬆ Back to Top](#top)

---

# 🛠 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js | Server Execution Environment |
| **Web Server** | Express.js | API Endpoints & Health Checks |
| **Telegram Bot** | Telegraf | Bot API Framework |
| **Database** | PostgreSQL | Relational Storage (Neon DB) |
| **Image Storage** | Cloudinary | Cloud Image Hosting |
| **Frontend UI** | HTML / CSS / JS | Web Dashboard Interface |
| **Testing Suite** | Mocha / Assert | Technical Audit Test Suite |

[⬆ Back to Top](#top)

---

# 🏗 Architecture Overview

The project follows a modular architecture to improve maintainability and scalability.

```text
                   Client
                      │
      ┌───────────────┴───────────────┐
      │                               │
 Telegram Bot                  Web Dashboard
      │                               │
      └───────────────┬───────────────┘
                      │
                 Express Server
                      │
      ┌───────────────┼───────────────┐
      │               │               │
   Handlers       Services        API Routes
      │               │
      └───────────────┘
              Business Logic
                      │
                  Data Models
                      │
              PostgreSQL (Neon)
```

[⬆ Back to Top](#top)

---

# 📂 Repository Structure

```text
Inventory_bot/
├── dashboard/
│   ├── index.html
│   ├── script.js
│   └── styles.css
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
│   ├── integration.test.js   # Integration tests
│   ├── e2e.test.js           # End-to-end tests
│   └── run.js                # Test runner
├── package.json
└── README.md
```

[⬆ Back to Top](#top)

---

# 📋 Requirements

* Node.js 14+
* PostgreSQL (Neon recommended)
* Telegram Bot Token
* Cloudinary Account

[⬆ Back to Top](#top)

---

# ⚙ Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Configure the variables:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

[⬆ Back to Top](#top)

---

# 🚀 Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd Inventory_bot
npm install
```

### 2. Initialize Database Tables
```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
psql "$DATABASE_URL" -f src/models/seed.sql
```

[⬆ Back to Top](#top)

---

# ▶ Running the Project

### Development Mode (with hot-reloads)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```
The dashboard will be available at `http://127.0.0.1:3000`.

[⬆ Back to Top](#top)

---

# 🧪 Running Staging Test Suite

The repository contains a test suite to audit stability and verify all conversational wizards, negative validations, role-based controls, and database aggregate helper behaviors:
```bash
npm test
```

[⬆ Back to Top](#top)

---

# 🌐 Web Dashboard Features

* View entire product catalog.
* Upload and change product images.
* Create, edit, and delete products.
* Real-time monitoring of stock levels.
* Account management (Sellers & Managers).
* View sales performance & store statistics.

[⬆ Back to Top](#top)

---

# 🤖 Telegram Bot Commands

| Command | Description |
| :--- | :--- |
| `/start` | Unified entry card with role-specific menu actions. |
| `/help` | Guidelines on command usages and shortcuts list. |
| `/menu` | Display command dashboard menu. |
| `/view_catalog` | List all products with specs, stock quantities, and details. |
| `/check_stock [barcode]` | Inspect inventory details of a specific barcode. |
| `/sell [barcode] [qty]` | Record sales and deduct stock from the catalog. |
| `/update_stock [barcode] [qty]`| Direct stock increment or reduction. |
| `/add_product` | Launch the conversational wizard to add a new catalog item. |
| `/owner_report` | View timeframe daily, weekly, or monthly Sales and Stock Audit logs. |
| `/manage_users` | View user profiles, ban/unban members, or promote roles. |
| `/exchange` | Get the current USD to KHR currency exchange rate. |

[⬆ Back to Top](#top)

---

# 📝 Development Notes

* `src/app.js` defines all dashboard API endpoints.
* `src/server.js` boots up the main Express server.
* `src/config/db.js` handles pool connections to PostgreSQL.
* `dashboard/` contains the dashboard HTML/CSS/JS frontend files.
* The dashboard can operate independently even if the Telegram Bot Token is missing.

[⬆ Back to Top](#top)

---

# ⭐ Professional Project Highlights

* **Clean Modular Architecture**: Clean decoupling of handlers, services, and models.
* **Robust Conversational State Machine**: Telegraf wizards for multi-step flows.
* **PostgreSQL Performance**: Optimized parameterized SQL queries.
* **Testing Rigor**: End-to-end, unit, and integration tests ensuring zero-crash compliance.

[⬆ Back to Top](#top)

---

# 📄 License

This project is licensed under the **MIT License**.
