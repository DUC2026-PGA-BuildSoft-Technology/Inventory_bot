#  Smart-Stock Inventory Bot

A Telegram-based inventory management system built with Node.js, Express.js, and PostgreSQL for wholesale shops in Orussey Market.

Developed for the Software Project Development course (2026).

---

#  Features

- Telegram user registration via `/start`
- Live product catalog display from PostgreSQL
- Stock lookup by barcode with `/check_stock`
- Sales recording through `/sell`
- Stock adjustment using `/update_stock`
- USD → KHR exchange rate via `/exchange`
- Inventory activity logging and low-stock notifications
- Simple Express health checks for server and database

---

# 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| Node.js | Backend |
| Express.js | API framework |
| PostgreSQL | Database |
| Telegraf | Telegram bot |
| Axios | External HTTP requests |

---

#  Project Structure

```text
Inventory_bot/
├── src/
│   ├── bot/
│   │   ├── bot.js
│   │   └── helpers.js
│   ├── config/
│   │   └── db.js
│   ├── handlers/
│   │   ├── catalog/
│   │   │   └── catalogCommand.js
│   │   ├── exchange/
│   │   │   └── exchangeCommand.js
│   │   ├── help/
│   │   │   └── helpCommand.js
│   │   ├── menu/
│   │   │   └── menuCommand.js
│   │   ├── sell/
│   │   │   └── sellCommand.js
│   │   ├── start/
│   │   │   └── startCommand.js
│   │   └── stock/
│   │       ├── checkStockCommand.js
│   │       ├── stockActionCommand.js
│   │       └── updateStockCommand.js
│   ├── models/
│   │   ├── productModel.js
│   │   ├── userModel.js
│   │   ├── Schema.sql
│   │   └── seed.sql
│   ├── services/
│   │   ├── apiService.js
│   │   ├── productService.js
│   │   ├── stockService.js
│   │   ├── salesService.js
│   │   └── userService.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

This project uses a handler-service-model pattern:
- Handlers receive Telegram commands, validate input, call services, and reply.
- Services contain business logic and coordinate database or external API calls.
- Models contain low-level database queries.

---

## Requirements

- Node.js 14+ (or later)
- PostgreSQL database
- Telegram bot token

---

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd Inventory_bot
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` from `.env.example` and set the required variables.

4. Start the app:

```bash
npm run dev
```

---

#  Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_token_here
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=verify-full&channel_binding=require
PORT=3000
```

---

#  Telegram Commands

Use the following commands from the Telegram bot chat:

- `/start` — register user and receive welcome message
- `/help` — view available bot commands
- `/menu` — show the command menu
- `/view_catalog` — list live products from the database
- `/check_stock [barcode]` — show stock details for a product
- `/sell [barcode] [qty]` — record a sale and reduce stock
- `/update_stock [barcode] [qty]` — adjust product stock quantity
- `/exchange` — fetch the USD → KHR exchange rate

Example:

```bash
/check_stock 885001
/sell 885001 2
/update_stock 885001 5
/exchange
/view_catalog
```

---

# `/exchange` Feature

The `/exchange` command calls `src/services/apiService.js` and retrieves a live USD to KHR rate from a public API.

Example bot reply:

```text
USD → KHR Exchange Rate

1 USD = 4,100 KHR
```

If the external API fails, the bot replies with:

```text
Unable to retrieve exchange rate. Please try again later.
```

---

## Run the App

Start in development mode:

```bash
npm run dev
```

Production start:

```bash
npm start
```

The app listens on the `PORT` value from `.env` (default `3000`).

---

## Database Setup

Create database tables:

```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
```

Seed demo data:

```bash
psql "$DATABASE_URL" -f src/models/seed.sql
```

---

## Clean Architecture

This repository is organized to separate concerns:
- `src/handlers` handles Telegram commands
- `src/services` contains business logic and service integrations
- `src/models` contains database access logic
- `src/bot/bot.js` is the main Telegraf startup and command registration file

---

## Git Workflow

Use feature branches and descriptive commit messages:

```bash
git checkout -b feat/exchange-command
npm install
npm run dev
./commit.sh "Add /exchange feature and API service"
git push origin feat/exchange-command
```

---

## License

MIT License
