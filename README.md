# 📦 Smart-Stock Inventory Bot

A Telegram-based inventory management system built with Node.js, Express.js, and PostgreSQL for wholesale shops in Orussey Market.

Developed for the Software Project Development course (2026).

---

# 🚀 Features

- Telegram user registration via `/start`
- Live product catalog display from PostgreSQL
- Stock lookup by barcode with `/check_stock`
- Sales recording through `/sell`
- Stock adjustment using `/update_stock`
- Inventory activity logging and low-stock notifications
- Simple Express health checks for server and database

---

# 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| Node.js | Backend |
| Express.js | API Framework |
| PostgreSQL | Database |
| Telegraf | Telegram Bot |
| Render | Hosting |

---

# 📁 Project Structure

```text
Inventory_bot/
├── src/
│   ├── bot/
│   │   ├── bot.js
│   │   └── helpers.js
│   ├── commands/
│   │   ├── actions/
│   │   │   └── stockActionCommand.js
│   │   ├── catalog/
│   │   │   └── catalogCommand.js
│   │   ├── help/
│   │   │   └── helpCommand.js
│   │   ├── sell/
│   │   │   └── sellCommand.js
│   │   └── stock/
│   │       ├── checkStockCommand.js
│   │       └── updateStockCommand.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── productModel.js
│   │   ├── userModel.js
│   │   ├── Schema.sql
│   │   └── seed.sql
│   ├── services/
│   │   └── userService.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Bot command logic is split into modular command files under `src/commands`, while `src/bot/bot.js` remains the central bot startup and command registration entry point.

---

## Requirements

- Node.js 14+ (or later)
- PostgreSQL database
- Telegram bot token

---

## Setup

1. Install dependencies:

```bash
git clone <repository-url>

cd Inventory_bot

npm install

npm run dev
```

---

# 🔐 Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_token_here

DATABASE_URL=postgresql://username:password@host:port/database?sslmode=verify-full&channel_binding=require

PORT=3000
```

---

# 🤖 Telegram Commands

```bash
/start
/help
/view_catalog
/check_stock 885001
/sell 885001 2
/update_stock 885001 10
```

---

# Live Command Integration Demo

Use these steps to show that the Telegram bot reads live inventory rows from PostgreSQL.

1. Create the database tables in Neon PostgreSQL.

```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
```

2. Add demo products if the products table is empty.

```bash
psql "$DATABASE_URL" -f src/models/seed.sql
```

Make sure `DATABASE_URL` points to a working PostgreSQL instance.

---

## Run the App

Start in development mode:

```bash
npm install
npm run dev
```

4. Open Telegram and run:

```bash
npm start
```

The app listens on `PORT` from `.env` (default `3000`).

---

## Telegram Commands

Use these commands from your Telegram bot chat:

- `/start` — register user and receive welcome message
- `/help` — view available bot commands
- `/view_catalog` — list live products from the database
- `/check_stock [barcode]` — show stock details for a product
- `/sell [barcode] [qty]` — record a sale and reduce stock
- `/update_stock [barcode] [qty]` — adjust product stock quantity

Example:

```bash
/check_stock 885001
/sell 885001 2
/check_stock 885001
/update_stock 885001 5
/view_catalog
```

The `/sell` command inserts a row into `sales`, reduces `products.stock_quantity`, writes a `stock_logs` row, and creates a low-stock notification when stock is low.

---

# Sprint 3 Agile Board Evidence

Create or update GitHub Project Board cards in the Sprint 3 columns:

| Column | Card | Developer Assignment |
| :--- | :--- | :--- |
| Todo | Create products/sales/stock_logs/notifications schema | Database & API Developer |
| In Progress | Implement `/view_catalog` live product query | Backend Developer |
| In Progress | Implement `/check_stock`, `/sell`, `/update_stock` | Backend Developer |
| Review | Verify Telegram command output with Neon data | QA / Scrum Master |
| Done | Commit schema and bot command integration | Assigned Developer |

Each card should link to the related commit, pull request, or issue. For the instructor demo, open the board and show the card movement across Sprint 3 columns.

---

# 🌿 Git Workflow

```bash
git checkout -b feat-user-registration

git add .

git commit -m "Add user registration"

git push origin feat-user-registration
```

Rules:
- Use feature branches
- Create Pull Requests
- Review code before merge
- Never push directly to main

---

# 👥 Team Members

| Name | Role |
| :--- | :--- |
| YOEUM Sochhiet | Product Owner |
| LORN David | Scrum Master QA |
| Udom Vathna | Developer |
| Meurn Chettra | Developer |
| LAO panha | Developer |

---

# 🚀 Deployment

Hosting Platform:
```text
Render
```

---

# 📄 License

MIT License
