# 📦 Smart-Stock Inventory Bot

> A professional inventory management application built for the **Software Project Development** course.

Smart-Stock is a full-stack inventory management system that combines a **Telegram Bot**, a **Responsive Web Dashboard**, **Cloudinary-powered image management**, and a **PostgreSQL (Neon)** backend into one integrated solution.

The application is designed for wholesale businesses to efficiently manage products, inventory, sales, and administrators through both a web dashboard and Telegram.

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
* [🌐 Web Dashboard Features](#-web-dashboard-features)
* [🤖 Telegram Bot Commands](#-telegram-bot-commands)
* [📝 Development Notes](#-development-notes)
* [⭐ Professional Project Highlights](#-professional-project-highlights)
* [📄 License](#-license)

---

# 📖 Project Summary

Smart-Stock is a professional inventory management application developed for the **Software Project Development** course.

The system integrates several technologies into one complete inventory platform.

### Core Components

* 🤖 Telegram Bot
* 🌐 Responsive Web Dashboard
* ☁️ Cloudinary Image Storage
* 🗄 PostgreSQL (Neon Database)

The application enables users to:

* Manage product inventory
* Record product sales
* Upload product images
* Track stock levels
* Manage administrators
* View dashboard analytics

[⬆ Back to Top](#top)

---

# ✨ Key Features

## 📦 Product Management

* Create products
* Edit products
* Delete products
* View product catalog

## 📊 Inventory Management

* Check stock quantity
* Update inventory
* Automatic stock status

Available status:

* Active
* Low Stock
* Out of Stock

## 💰 Sales Management

* Record sales
* Automatically deduct stock
* Maintain inventory accuracy

## 👤 User Management

* Create Seller accounts
* Create Manager accounts
* Store Telegram IDs
* Role-based access

## 🌐 Dashboard

* Responsive UI
* Product image upload
* Dashboard statistics
* Product management
* Admin management

## 🤖 Telegram Bot

* View catalog
* Check stock
* Update stock
* Record sales
* Exchange rate lookup
* Interactive menu

[⬆ Back to Top](#top)

---

# 🛠 Technology Stack

| Layer         | Technology        |
| ------------- | ----------------- |
| Backend       | Node.js           |
| Framework     | Express.js        |
| Telegram Bot  | Telegraf          |
| Database      | PostgreSQL (Neon) |
| Frontend      | HTML              |
| Styling       | CSS               |
| Client-side   | JavaScript        |
| Image Storage | Cloudinary        |
| HTTP Client   | Axios             |

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

### Folder Responsibilities

| Folder        | Description                 |
| ------------- | --------------------------- |
| src/bot       | Telegram Bot initialization |
| src/handlers  | Telegram command handlers   |
| src/services  | Business logic              |
| src/models    | Database queries            |
| src/config    | Database configuration      |
| dashboard     | Web dashboard               |
| src/app.js    | API routes                  |
| src/server.js | Application startup         |

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
│   ├── config/
│   ├── handlers/
│   ├── models/
│   ├── services/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

[⬆ Back to Top](#top)

---

# 📋 Requirements

Before running the project, install:

* Node.js 14+
* PostgreSQL (Neon recommended)
* Telegram Bot Token
* Cloudinary Account

[⬆ Back to Top](#top)

---

# ⚙ Environment Configuration

Copy the environment template.

```bash
cp .env.example .env
```

Update the following values.

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

[⬆ Back to Top](#top)

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone <repository-url>
cd Inventory_bot
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment

Create a `.env` file from `.env.example`.

## 4. Initialize Database

```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
```

## 5. Seed Demo Data

```bash
psql "$DATABASE_URL" -f src/models/seed.sql
```

[⬆ Back to Top](#top)

---

# ▶ Running the Project

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

Open the dashboard:

```text
http://127.0.0.1:3000
```

[⬆ Back to Top](#top)

---

# 🌐 Web Dashboard Features

The dashboard allows administrators to:

* View product catalog
* Upload product images
* Create products
* Edit products
* Delete products
* Monitor stock levels
* Add seller accounts
* Add manager accounts
* View dashboard statistics

[⬆ Back to Top](#top)

---

# 🤖 Telegram Bot Commands

| Command                         | Description                 |
| ------------------------------- | --------------------------- |
| `/start`                        | Register user               |
| `/help`                         | Show available commands     |
| `/menu`                         | Display command menu        |
| `/view_catalog`                 | View product catalog        |
| `/check_stock [barcode]`        | Check product stock         |
| `/sell [barcode] [qty]`         | Record a sale               |
| `/update_stock [barcode] [qty]` | Update stock quantity       |
| `/exchange`                     | Get USD → KHR exchange rate |

### Example

```text
/check_stock 885001
/sell 885001 2
/update_stock 885001 5
/view_catalog
/exchange
```

[⬆ Back to Top](#top)

---

# 📝 Development Notes

* `src/app.js` defines API endpoints.
* `src/server.js` starts the Express server.
* `src/config/db.js` manages PostgreSQL connections.
* `dashboard/` contains frontend assets.
* The dashboard can run even if the Telegram bot token is not configured.

[⬆ Back to Top](#top)

---

# ⭐ Professional Project Highlights

This project demonstrates:

* Clean architecture
* Modular project structure
* RESTful API development
* Telegram Bot integration
* Responsive web dashboard
* PostgreSQL database integration
* Cloudinary image storage
* Environment-based configuration
* Full-stack JavaScript development
* Academic software engineering best practices

[⬆ Back to Top](#top)

---

# 📄 License

This project is licensed under the **MIT License**.

[⬆ Back to Top](#top)
