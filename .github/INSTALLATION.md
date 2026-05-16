# Installation & Setup Instructions

Complete step-by-step guide to get Smart-Stock Inventory Bot running locally.

## Prerequisites

### Required Software
- [Node.js](https://nodejs.org) version 14.0.0 or higher
- [npm](https://www.npmjs.com) version 6.0.0 or higher
- [Git](https://git-scm.com)
- Text editor (VS Code recommended)

### Required Accounts
- Telegram account
- GitHub account
- Neon DB account (free tier available)

### Check Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

All should show version numbers ✓

## Setup Steps

### Step 1: Clone Repository

```bash
# Navigate to your projects directory
cd your_projects_folder

# Clone the repository
git clone https://github.com/your-org/Inventory_bot.git

# Enter project directory
cd Inventory_bot
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Verify installation
npm list --depth=0
```

Expected packages:
- express
- dotenv
- pg
- telegraf
- nodemon

### Step 3: Setup Telegram Bot

**See [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) for detailed instructions**

Quick summary:
1. Open Telegram, search `@BotFather`
2. Send `/newbot`
3. Choose bot name and username
4. Copy the token

### Step 4: Setup Neon Database

**See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions**

Quick summary:
1. Sign up at https://neon.tech
2. Create new project
3. Get connection string
4. Execute SQL schema in Neon editor

### Step 5: Create .env File

```bash
# Copy example to actual .env
cp .env.example .env
```

### Step 6: Configure .env File

Open `.env` and fill in your values:

```env
# Your Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE

# Your Neon DB Connection String
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 7: Verify Database Connection

```bash
# Start the bot
npm run dev
```

Check console output:
```
✓ Database connection established
✓ Express server running on port 3000
✓ Telegram bot is running
```

### Step 8: Test the Bot

1. Open Telegram
2. Find your bot: `@your_bot_username`
3. Click "Start"
4. Send `/start` - Should register you
5. Send `/help` - Should show commands

## Development Workflow

### Run Development Server

```bash
npm run dev
```

Features:
- Auto-reload on file changes
- Detailed console logging
- Direct error output

### File Structure Reference

```
src/
├── config/db.js           ← Database connection
├── models/userModel.js    ← Database queries
├── services/userService.js ← Business logic
├── bot/bot.js             ← Bot commands
└── app.js                 ← Express server
```

### Making Changes

```bash
# 1. Make code changes in src/
# 2. Bot auto-reloads
# 3. Check console for errors
# 4. Test in Telegram
```

## Troubleshooting

### Installation Issues

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

#### Node version too old
```bash
# Install latest Node.js from https://nodejs.org
node --version  # Should be >= 14.0.0
```

### Telegram Bot Issues

#### Bot doesn't respond
1. Verify TELEGRAM_BOT_TOKEN in `.env`
2. Check bot is running: `npm run dev`
3. Check console for errors
4. See [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)

#### Telegram returns "Token is invalid"
1. Verify token is copied correctly (no spaces)
2. Check token from @BotFather again
3. Ensure `.env` file is used (not hardcoded)

### Database Issues

#### "Cannot connect to database"
1. Verify DATABASE_URL in `.env`
2. Check Neon DB is running
3. Test endpoint: `curl http://localhost:3000/health/db`
4. See [DATABASE_SETUP.md](DATABASE_SETUP.md)

#### "SSL certificate error"
```
Error: self signed certificate
```
Solution: Already configured in `src/config/db.js`

#### Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

## First-Time Workflow

1. ✅ Clone repository
2. ✅ Run `npm install`
3. ✅ Copy `.env.example` to `.env`
4. ✅ Get Telegram bot token (see TELEGRAM_SETUP.md)
5. ✅ Get Neon database URL (see DATABASE_SETUP.md)
6. ✅ Fill in `.env` with tokens and URL
7. ✅ Run `npm run dev`
8. ✅ Test bot in Telegram

## Next Steps

After successful setup:

1. **Create GitHub issues** for features you'll work on
2. **Create feature branches** for your work
3. **Follow Git workflow** (see GITHUB_WORKFLOW.md)
4. **Read documentation** in each file
5. **Join team collaboration** on GitHub

## Documentation

- [README.md](README.md) - Project overview
- [GITHUB_WORKFLOW.md](GITHUB_WORKFLOW.md) - Team collaboration
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database guide
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Bot token setup
- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) - SQL schema

## Getting Help

1. Check [Troubleshooting](#troubleshooting) section
2. Read relevant documentation file
3. Check console output for error messages
4. Ask team members on GitHub Issues
5. Create new GitHub Issue with:
   - What you tried
   - Error message
   - Your environment (Node version, OS, etc.)

## Production Deployment

Once development is complete:

1. Push to `develop` branch
2. Create Pull Request
3. Get team review
4. Merge to `develop`
5. Deploy to staging
6. Create PR to `main`
7. Deploy to production

See [render.yaml](render.yaml) for Render deployment config.

---

**You're ready to go! Happy coding! 🚀**
