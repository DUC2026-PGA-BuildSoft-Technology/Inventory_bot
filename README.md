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
```

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
| LORN David | Project Manager |
| Udom Vathna | Backend Developer |
| Meurn Chettra | Database & API Developer |

---

# 🚀 Deployment

Hosting Platform:
```text
Render
```

---

# 📄 License

MIT License
