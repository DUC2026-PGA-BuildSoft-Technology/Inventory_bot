#  Smart-Stock Inventory Bot

A professional Telegram-based inventory management system built with Node.js, Express.js, and PostgreSQL. Designed for wholesale garment or electronics shops in Orussey Market.

This project is developed for the Software Project Development course (2026).

---

# 📋 Project Overview

The Smart-Stock Inventory Bot helps shop owners manage inventory remotely through Telegram.

The system supports:

- **User Registration**: Automatic user registration via Telegram
- **Real-time Stock Checking**: Check inventory instantly
- **Inventory Updates**: Update stock levels in real-time
- **Sales Recording**: Record sales transactions
- **Product CRUD Management**: Create, read, update, delete products
- **Google Sheets Synchronization**: Sync data with spreadsheets (coming soon)
- **Database Integration**: Secure PostgreSQL storage
- **Multi-user Support**: Support for staff and admin roles

---

# 🎯 Problem Statement

Shop owners are often outside the shop.

When customers ask about product availability, the owner must contact staff to manually check inventory on the shelf.

This process:

- ❌ Wastes time
- ❌ Slows customer response
- ❌ Creates communication problems
- ❌ Causes inventory inaccuracies

**Solution**: The Smart-Stock Inventory Bot solves this problem using Telegram automation for Team 7 DUC.

---

# 🚀 Quick Start

## Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Telegram Bot Token
- Neon DB Account

## Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd Inventory_bot

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your credentials:
# TELEGRAM_BOT_TOKEN=your_token_here
# DATABASE_URL=postgresql://...
# PORT=3000

# 5. Setup database
# Execute SQL from DATABASE_SCHEMA.sql in Neon

# 6. Run application
npm run dev
```

---

# 📁 Project Structure

```
Inventory_bot/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── models/
│   │   └── userModel.js          # User database operations
│   ├── bot/
│   │   └── bot.js                # Telegram bot setup & commands
│   ├── services/
│   │   └── userService.js        # Business logic layer
│   ├── routes/                   # API routes (extensible)
│   ├── server.js                 # Entry point
│   └── app.js                    # Express app setup
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── DATABASE_SCHEMA.sql           # PostgreSQL schema
├── DATABASE_SETUP.md             # Database setup guide
├── GITHUB_WORKFLOW.md            # Team collaboration guide
├── render.yaml                   # Render deployment config
└── README.md                     # This file
```

---

# 🤖 Telegram Commands

### `/start`
Registers new users or welcomes returning users
```
Welcome! You have been registered for Smart-Stock Inventory Bot.
```

### `/help`
Shows available commands
```
Available Commands:
/start - Register account
/help - Show commands
```

---

# 🗄️ Database

### Schema
PostgreSQL users table with Telegram integration:
- User ID (Telegram)
- Username
- First/Last Name
- Role (staff/admin)
- Timestamps

See [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) for full schema.

### Setup
See [DATABASE_SETUP.md](DATABASE_SETUP.md) for:
- Neon DB configuration
- Local PostgreSQL setup
- Troubleshooting guide

---

# 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express.js |
| Bot | Telegraf |
| Database | PostgreSQL (Neon DB) |
| Configuration | dotenv |
| Deployment | Render |

---

# 📦 API Endpoints

### Health Check
```
GET /
```
Returns server status

### Database Health Check
```
GET /health/db
```
Returns database connection status

---

# 👥 Team Structure

| Developer | Role | Branch |
|-----------|------|--------|
| Dev 1 | Telegram Bot Commands | `feat-telegram-commands` |
| Dev 2 | Database Integration | `feat-db-integration` |
| Dev 3 | Backend APIs & Testing | `feat-backend-apis` |

See [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md) for detailed collaboration guidelines.

---

# 🌿 Git Workflow

```bash
# Create feature branch
git checkout -b feat-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push and create PR
git push origin feat-feature-name

# After review and approval
git merge develop
```

**Rules:**
- ✅ All work on feature branches
- ✅ Create GitHub Issues for features
- ✅ PR review required before merge
- ❌ Never push directly to main
- ❌ Never push directly to develop

---

# 🚀 Deployment

### Development
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes

### Production
```bash
npm start
```

### Render Deployment
See [render.yaml](render.yaml) for automatic configuration

---

# 🧪 Testing

```bash
# Health check
curl http://localhost:3000/

# DB health check
curl http://localhost:3000/health/db

# Send /start to bot in Telegram
# Send /help to bot in Telegram
```

---

# 📚 Documentation

- [Database Setup Guide](DATABASE_SETUP.md) - Neon DB and PostgreSQL configuration
- [GitHub Workflow](GITHUB_WORKFLOW.md) - Team collaboration and branching strategy
- [SQL Schema](DATABASE_SCHEMA.sql) - Database structure and indexes
- [Render Configuration](render.yaml) - Deployment configuration

---

# 🔒 Security

- Environment variables stored in `.env` (not committed)
- PostgreSQL SSL connections enabled
- Input validation and error handling
- Secure token management
- Production-ready logging

---

# 📝 Environment Variables

```env
# Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=your_token_here

# Neon DB Connection String
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Server Port
PORT=3000

# Environment
NODE_ENV=development
```

---

# 🛠️ Available Scripts

```bash
npm start              # Production server
npm run dev            # Development server (auto-reload)
npm test               # Run tests (to be implemented)
```

---

# 🐛 Troubleshooting

### Bot not responding
1. Verify TELEGRAM_BOT_TOKEN in `.env`
2. Check if bot is running: `npm run dev`
3. Check console for error messages

### Database connection failed
1. Verify DATABASE_URL is correct
2. Check Neon DB is active
3. Test: `curl http://localhost:3000/health/db`

### Port already in use
```bash
# Kill process using port 3000
kill $(lsof -t -i:3000)
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for more troubleshooting.

---

# 📄 License

MIT License - Feel free to use this project for personal or commercial use.

---

# 👥 Contributors

**Team 7 DUC - Software Project Development 2026**

- Dev 1 - Telegram Bot Commands
- Dev 2 - Database Integration
- Dev 3 - Backend APIs & Testing

---

# 📞 Support

For issues and questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Review [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md)
4. Create GitHub Issue with details

---

**Smart-Stock Inventory Bot v1.0.0** - Production Ready ✅
