# 📦 Smart-Stock Inventory Bot

A Telegram-based inventory management system built with Node.js, Express.js, and PostgreSQL for wholesale shops in Orussey Market.

Developed for the Software Project Development course (2026).

---

# 🚀 Features

- User registration with Telegram
- Real-time stock checking
- Inventory updates
- Sales recording
- PostgreSQL database integration
- Multi-user support
- Secure environment variables

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
│   ├── config/
│   ├── models/
│   ├── services/
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# ⚡ Installation

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

DATABASE_URL=your_postgresql_url

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

3. Start the bot locally.

```bash
npm install
npm run dev
```

4. Open Telegram and run:

```bash
/start
/view_catalog
```

Expected result: the bot replies with "Live Product Catalog" and renders current rows from the `products` table as an inline Telegram menu. If you update a product stock value in PostgreSQL and run `/view_catalog` again, the Telegram menu shows the updated quantity.

5. Demonstrate live database operations:

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
