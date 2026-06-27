# Quick Reference Guide

## Project Commands

```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Install dependencies
npm install

# Alternative: using Make
make dev
make start
make setup
```

## File Locations

| File | Purpose |
|------|---------|
| `src/server.js` | Entry point |
| `src/app.js` | Express setup |
| `src/config/db.js` | Database connection |
| `src/models/userModel.js` | DB operations |
| `src/services/userService.js` | Business logic |
| `src/bot/bot.js` | Telegram bot setup |
| `.env` | Environment variables (SECRET) |
| `.env.example` | Template for .env |

## Bot Commands

| Command | Function |
|---------|----------|
| `/start` | Register user / Welcome message |
| `/help` | Show available commands |

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Server health check |
| `GET /health/db` | Database health check |

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | ✓ | `123456:ABC-DEF...` |
| `DATABASE_URL` | ✓ | `postgresql://...` |
| `PORT` | Optional | `3000` |
| `NODE_ENV` | Optional | `development` |

## Git Branches

```
main (production)
  ↑
  └─ develop (staging)
      ↑
      ├─ feat-telegram-commands (Dev 1)
      ├─ feat-db-integration (Dev 2)
      └─ feat-backend-apis (Dev 3)
```

## Team Responsibilities

| Dev | Feature | Branch |
|-----|---------|--------|
| Dev 1 | Telegram Bot Commands | `feat-telegram-commands` |
| Dev 2 | Database Integration | `feat-db-integration` |
| Dev 3 | Backend APIs & Testing | `feat-backend-apis` |

## Project Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js 4+
- **Bot**: Telegraf 4+
- **Database**: PostgreSQL (Neon DB)
- **Config**: dotenv
- **Dev**: nodemon
- **Deployment**: Render

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Documentation Map

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview |
| [INSTALLATION.md](INSTALLATION.md) | Setup guide |
| [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) | Bot token setup |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | DB configuration |
| [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md) | Team collaboration |
| [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) | SQL schema |

## Troubleshooting Quick Fix

### Bot not responding
```bash
# 1. Check .env file has correct token
cat .env | grep TELEGRAM_BOT_TOKEN

# 2. Restart bot
npm run dev

# 3. Check console for errors
```

### Database connection error
```bash
# 1. Test database connection
curl http://localhost:3000/health/db

# 2. Verify .env has DATABASE_URL
cat .env | grep DATABASE_URL

# 3. Check Neon DB is running
```

### Port in use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

## First-Time Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Get Telegram token from @BotFather
- [ ] Get Neon DB connection string
- [ ] Fill in `.env` file
- [ ] Execute DATABASE_SCHEMA.sql
- [ ] Run `npm run dev`
- [ ] Test bot in Telegram
- [ ] Create GitHub branch
- [ ] Start development

## Deployment to Render

1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `DATABASE_URL`
   - `PORT=3000`
4. Deploy with `npm start`

## Key Files Summary

**Entry Points**
- `src/server.js` - Start here
- `src/app.js` - Express + Bot initialization

**Core Logic Services**
- `src/services/userService.js` - Profile, roles, and ban checks
- `src/services/productService.js` - Inventory catalog & wizard wizard
- `src/services/salesService.js` - Sales transaction recorder & reports
- `src/services/salesListService.js` - Cart manager & locks coordinator
- `src/services/stockService.js` - Incremental auditing adjustments
- `src/services/apiService.js` - External Unsplash asset fetching

**Database Models**
- `src/models/userModel.js` - User table queries
- `src/models/productModel.js` - Product table queries & locks
- `src/models/Schema.sql` - Table schema statements

**Bot Controllers**
- `src/bot/bot.js` - Router engine and command hook setups

**Configuration**
- `.env` - Environment secrets (not committed)
- `package.json` - Dependencies & scripts
- `src/config/db.js` - DB connection pool

## Common Git Commands

```bash
# Start new feature
git checkout -b feat-feature-name

# Push changes
git push origin feat-feature-name

# Create pull request on GitHub

# After merge, clean up
git checkout develop
git pull origin develop
git branch -d feat-feature-name
```

---

**Keep this guide handy during development! 📋**
