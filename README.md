# Smart-Stock Inventory Bot

A professional inventory management application built for the Software Project Development course.
This system combines a Telegram bot, a responsive web dashboard, Cloudinary-powered image management, and a Neon/PostgreSQL backend.

---

## 📑 Table of Contents
- [Project Summary](#project-summary)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Requirements](#requirements)
- [Environment Configuration](#environment-configuration)
- [Setup Instructions](#setup-instructions)
- [Web Dashboard Features](#web-dashboard-features)
- [Telegram Bot Commands](#telegram-bot-commands)
- [Development Notes](#development-notes)
- [Professional Project Highlights](#professional-project-highlights)
- [Run Commands](#run-commands)
- [License](#license)

---

## Project Summary

Smart-Stock is designed to support wholesale inventory operations with a clean user experience for both Telegram users and dashboard administrators.
It enables product CRUD, stock tracking, sales recording, inventory alerts, and team access management in one integrated solution.

[⬆ Back to Top](#smart-stock-inventory-bot)

---

## What This Project Demonstrates

- **Full-stack JavaScript development** using Node.js and Express
- **Telegram bot integration** with Telegraf
- **Cloud-hosted PostgreSQL** database support (Neon-compatible)
- **Responsive dashboard UI** built with HTML, CSS, and vanilla JavaScript
- **Image upload and storage** using Cloudinary
- **Separation of concerns** using handlers, services, and models
- **Professional project structure** suitable for academic presentation

[⬆ Back to Top](#smart-stock-inventory-bot)

---

## Key Features

- **Product Catalog Management:** Create, edit, and delete operations.
- **Responsive Dashboard:** Optimized for both desktop and mobile views.
- **Image Upload:** Product image integration through Cloudinary.
- **Access Management:** Admin creation for seller and manager roles using Telegram IDs.
- **Stock Status Indicators:** Easily identify `active`, `low_stock`, and `out_of_stock` items.
- **Telegram Commands:** Quick access for stock lookup, sales, and stock updates directly from chat.
- **Live Dashboard Metrics:** Monitor inventory levels and admin counts at a glance.
- **Health Checks:** Built-in monitoring for server and database connectivity.

[⬆ Back to Top](#smart-stock-inventory-bot)

---

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Telegram** | Telegraf |
| **Database** | PostgreSQL / Neon |
| **Frontend** | HTML, CSS, JavaScript |
| **Storage** | Cloudinary |
| **HTTP Client** | Axios |

[⬆ Back to Top](#smart-stock-inventory-bot)

---

## Architecture Overview

The repository uses a modular architecture to keep features maintainable and scalable.

- `src/bot` — Telegram bot initialization and command registration
- `src/handlers` — Command handlers and bot interaction logic
- `src/services` — Business logic and external API coordination
- `src/models` — Database access and SQL query logic
- `src/config` — Database configuration and shared connection pool
- `dashboard` — Frontend assets for the web dashboard
- `src/app.js` — API routes and dashboard integration
- `src/server.js` — Application bootstrap and server startup

[⬆ Back to Top](#smart-stock-inventory-bot)

---

## Repository Structure

```text
Inventory_bot/
├── dashboard/
│   ├── index.html
│   ├── script.js
│   └── styles.css
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
