# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  TELEGRAM BOT USERS                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
    ┌─────────────────────────────────────────┐
    │   TELEGRAF BOT (src/bot/bot.js)         │
    │  ┌────────────┐  ┌────────────────┐    │
    │  │ /start cmd │  │  /help command │    │
    │  └─────┬──────┘  └────────────────┘    │
    │        │                                │
    │        ├─→ userService.registerOrGetUser()
    │        └─→ Update user activity         │
    └─────────────────────────────────────────┘
                           │
                           ↓
    ┌─────────────────────────────────────────┐
    │ USER SERVICE (src/services/userService) │
    │ - registerOrGetUser()                   │
    │ - getHelpMessage()                      │
    │ - updateUserActivity()                  │
    └──────────┬──────────────────────────────┘
               │
               ↓
    ┌─────────────────────────────────────────┐
    │ USER MODEL (src/models/userModel)       │
    │ - findUserByTelegramId()                │
    │ - createUser()                          │
    │ - updateUserActivity()                  │
    └──────────┬──────────────────────────────┘
               │
               ↓
    ┌─────────────────────────────────────────┐
    │ DATABASE (src/config/db.js)             │
    │ - Connection Pool                       │
    │ - SSL Configuration                     │
    │ - Query Execution                       │
    └──────────┬──────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│              NEON PostgreSQL Database                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Table: users                                          │ │
│  │  - id (PRIMARY KEY)                                    │ │
│  │  - telegram_id (UNIQUE)                                │ │
│  │  - username                                            │ │
│  │  - first_name, last_name                               │ │
│  │  - role, created_at, updated_at                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Express Server Architecture

```
┌─────────────────────────────────────────┐
│   EXPRESS SERVER (src/app.js)           │
│                                         │
│  ┌───────────────┐  ┌────────────────┐ │
│  │ Middleware    │  │ Routes         │ │
│  ├───────────────┤  ├────────────────┤ │
│  │ JSON Parser   │  │ GET /          │ │
│  │ Logger        │  │ GET /health/db │ │
│  │ Error Handler │  │ 404 Handler    │ │
│  └───────────────┘  └────────────────┘ │
│                                         │
│  PORT: 3000                             │
└─────────────────────────────────────────┘
```

## Request Flow - /start Command

```
User → /start
   ↓
Telegraf Bot receives update
   ↓
bot.start() handler
   ↓
userService.registerOrGetUser(ctx)
   ↓
userModel.findUserByTelegramId(telegramId)
   ↓
Database query to users table
   ↓
┌─────────────────────┐
│  User found?        │
└──────┬──────────────┘
       │
   ┌───┴───┐
   ↓       ↓
  YES     NO
   ↓       ↓
Return  userModel.createUser()
existing→ Create new record
user     ↓
   ↓    Return new user
   │       ↓
   └──→ Generate message
         ↓
      ctx.reply()
         ↓
      Message sent to user
```

## Data Flow Diagram

```
Telegram API
    ↓
Telegraf (webhook/polling)
    ↓
Bot Commands (/start, /help)
    ↓
Service Layer (Business Logic)
    ↓
Model Layer (Database Operations)
    ↓
Database Layer (Connection Pool)
    ↓
Neon PostgreSQL
```

## Module Dependencies

```
server.js (Entry)
    ↓
app.js
    ├── bot/bot.js
    │   └── services/userService.js
    │       └── models/userModel.js
    │           └── config/db.js
    │
    ├── Express Routes
    │   └── API endpoints
    │
    └── Health Checks
        └── config/db.js
```

## Security Architecture

```
┌────────────────────────────────────┐
│ ENVIRONMENT VARIABLES              │
├────────────────────────────────────┤
│ .env (SECRET - NOT COMMITTED)      │
│ ├── TELEGRAM_BOT_TOKEN             │
│ ├── DATABASE_URL                   │
│ └── PORT, NODE_ENV                 │
│                                    │
│ .env.example (TEMPLATE - PUBLIC)   │
│ ├── Template for .env              │
│ └── No real values                 │
└────────────────────────────────────┘
        ↓ (loaded by dotenv)
┌────────────────────────────────────┐
│ APPLICATION RUNTIME                │
├────────────────────────────────────┤
│ Bot connects with token            │
│ DB connects with URL               │
│ All secrets in memory              │
│ Never logged or exposed            │
└────────────────────────────────────┘
        ↓
┌────────────────────────────────────┐
│ TELEGRAM API / NEON DB             │
├────────────────────────────────────┤
│ SSL/TLS encrypted connections      │
│ Prepared statements (SQL injection)│
│ Token-based authentication         │
└────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│ GITHUB REPOSITORY                   │
│ ├── main (production)               │
│ ├── develop (staging)               │
│ └── feature branches                │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ RENDER.COM                          │
│ ├── Environment Variables           │
│ ├── Build: npm install              │
│ ├── Start: npm start                │
│ └── Health Check: GET /             │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT               │
│ ├── Node.js Server                  │
│ ├── Express + Telegraf              │
│ └── Connected to Neon DB            │
└─────────────────────────────────────┘
```

## Technology Stack Layers

```
┌──────────────────────────────────────────────┐
│         APPLICATION LAYER                    │
│  - Telegram Bot Commands                     │
│  - Express Routes                            │
│  - API Endpoints                             │
└────────────┬─────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│         BUSINESS LOGIC LAYER                 │
│  - User Registration Logic                   │
│  - Service Functions                         │
└────────────┬─────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│         DATA ACCESS LAYER                    │
│  - Database Models                           │
│  - SQL Queries                               │
│  - Data Validation                           │
└────────────┬─────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│         DATABASE LAYER                       │
│  - Connection Pool                           │
│  - SSL Encryption                            │
│  - Query Execution                           │
└────────────┬─────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────┐
│         EXTERNAL SERVICES                    │
│  - Neon PostgreSQL                           │
│  - Telegram API                              │
└──────────────────────────────────────────────┘
```

## File Organization

```
src/
├── config/          (Configuration)
│   └── db.js       (Database setup)
│
├── models/          (Data Access)
│   └── userModel.js (DB operations)
│
├── services/        (Business Logic)
│   └── userService.js
│
├── bot/             (Bot Commands)
│   └── bot.js       (Telegram setup)
│
├── routes/          (API Routes)
│   └── (expandable)
│
├── server.js        (Entry Point)
└── app.js           (Express Setup)
```

## Git Workflow Diagram

```
        ┌─────────────────────────────┐
        │   GITHUB ISSUES             │
        │   Create issues for work    │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ CREATE FEATURE BRANCH       │
        │ git checkout -b feat-...    │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ DEVELOPMENT                 │
        │ Make changes & commits      │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ PUSH & PULL REQUEST         │
        │ git push origin feat-...    │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ CODE REVIEW                 │
        │ Team reviews PR             │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ MERGE TO DEVELOP            │
        │ After approval              │
        └────────────┬────────────────┘
                     ↓
        ┌─────────────────────────────┐
        │ MERGE TO MAIN (Release)     │
        │ After testing               │
        └─────────────────────────────┘
```

---

This architecture is:
- ✅ Modular and extensible
- ✅ Follows clean architecture principles
- ✅ Ready for team development
- ✅ Production-ready
- ✅ Security-focused
- ✅ Easy to maintain
