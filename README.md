# Smart-Stock Inventory Bot

### Live Staging Bot
https://t.me/SmartStockInventoryBot

Smart-Stock is a full-stack inventory management system that combines a **Telegram Bot**, a **Responsive Web Dashboard**, **Cloudinary-powered image management**, and a **PostgreSQL (Neon)** backend into one integrated solution.

Developed for the course **Software Project Development (2026)**, it is designed for wholesale shops in Orussey Market to efficiently manage products, inventory, sales, and administrators.

---

<a id="top"></a>

# Table of Contents

- [Project Summary](#project-summary)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [System Workflow](#system-workflow)
- [User Roles & Permissions](#user-roles--permissions)
- [Database Schema Overview](#database-schema-overview)
- [Requirements](#requirements)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Running Staging Test Suite](#running-staging-test-suite)
- [Web Dashboard Features](#web-dashboard-features)
- [Telegram Bot Commands](#telegram-bot-commands)
- [API Endpoints](#api-endpoints)
- [Development Notes](#development-notes)
- [Professional Project Highlights](#professional-project-highlights)
- [License](#license)

---

<a id="project-summary"></a>

# Project Summary

Smart-Stock integrates several technologies into one inventory platform.

- Telegram Bot
- Responsive Web Dashboard
- PostgreSQL (Neon)
- Cloudinary
- REST API

[⬆ Back to Top](#top)

---

<a id="key-features"></a>

# Key Features

## Product & Stock Management

- Conversational Product Wizard
- Barcode Character Counter
- Inventory Control
- Cloudinary Image Upload

## Sales & Reporting

- Sales Recording
- Stock Reports
- History Logs

## Telegram Bot

- Reply Keyboard
- Inline Pagination
- Dashboard
- Exchange Rate
- Validation

[⬆ Back to Top](#top)

---

<a id="technology-stack"></a>

# Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js |
| API | Express.js |
| Telegram | Telegraf |
| Database | PostgreSQL (Neon) |
| Image Storage | Cloudinary |
| Frontend | HTML CSS JavaScript |
| Testing | Mocha |

[⬆ Back to Top](#top)

---

<a id="architecture-overview"></a>

# Architecture Overview

```text
                   Client
                      │
      ┌───────────────┴───────────────┐
Telegram Bot                    Web Dashboard
      └───────────────┬───────────────┘
                      │
                Express Server
                      │
      ┌───────────────┼───────────────┐
   Handlers        Services        API Routes
      └───────────────┬───────────────┘
                      │
               Business Logic
                      │
                 Data Models
                      │
              PostgreSQL (Neon)
```

[⬆ Back to Top](#top)

---

<a id="repository-structure"></a>

# Repository Structure

```text
Smart-Stock/
│
├── bot/
├── handlers/
├── services/
├── routes/
├── middleware/
├── models/
├── config/
├── dashboard/
├── public/
├── tests/
├── uploads/
├── package.json
└── README.md
```

[⬆ Back to Top](#top)

---

<a id="system-workflow"></a>

# System Workflow

1. User sends command to Telegram Bot.
2. Bot validates input.
3. Express receives request.
4. Business logic processes request.
5. PostgreSQL stores data.
6. Cloudinary stores images.
7. Dashboard displays updated information.

[⬆ Back to Top](#top)

---

<a id="user-roles--permissions"></a>

# User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Owner | Full Access |
| Stock Manager | Inventory Management |
| Seller | Sales & Checkout |

[⬆ Back to Top](#top)

---

<a id="database-schema-overview"></a>

# Database Schema Overview

Main Tables

- Users
- Products
- Categories
- Inventory
- Sales
- History Logs

Relationships

```
Users
  │
Products
  │
Inventory
  │
Sales
```

[⬆ Back to Top](#top)

---

<a id="requirements"></a>

# Requirements

- Node.js 20+
- PostgreSQL Database
- Cloudinary Account
- Telegram Bot Token

[⬆ Back to Top](#top)

---

<a id="environment-configuration"></a>

# Environment Configuration

Create a `.env` file.

```env
BOT_TOKEN=

DATABASE_URL=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

PORT=3000
```

[⬆ Back to Top](#top)

---

<a id="installation"></a>

# Installation

```bash
git clone <repository>

cd Smart-Stock

npm install
```

[⬆ Back to Top](#top)

---

<a id="running-the-project"></a>

# Running the Project

Development

```bash
npm run dev
```

Production

```bash
npm start
```

[⬆ Back to Top](#top)

---

<a id="running-staging-test-suite"></a>

# Running Staging Test Suite

```bash
npm test
```

[⬆ Back to Top](#top)

---

<a id="web-dashboard-features"></a>

# Web Dashboard Features

- Login
- Dashboard
- Product Management
- Inventory
- Sales
- Reports
- User Management
- Image Upload

[⬆ Back to Top](#top)

---

<a id="telegram-bot-commands"></a>

# Telegram Bot Commands

| Command | Description |
|----------|-------------|
| /start | Start Bot |
| /menu | Main Menu |
| /catalog | Product Catalog |
| /add_product | Add Product |
| /exchange | Currency Exchange |
| /history | History |
| /profile | User Profile |

[⬆ Back to Top](#top)

---

<a id="api-endpoints"></a>

# API Endpoints

| Method | Endpoint |
|---------|----------|
| GET | /health |
| GET | /products |
| POST | /products |
| PUT | /products/:id |
| DELETE | /products/:id |
| POST | /sales |

[⬆ Back to Top](#top)

---

<a id="development-notes"></a>

# Development Notes

- Modular Architecture
- MVC Pattern
- RESTful APIs
- Clean Code
- Input Validation
- Error Handling
- Unit Testing

[⬆ Back to Top](#top)

---

<a id="professional-project-highlights"></a>

# Professional Project Highlights

- Full Stack Project
- Telegram Bot Integration
- Responsive Dashboard
- Cloudinary Image Storage
- PostgreSQL Database
- REST API
- Role-Based Access Control
- Audit Logs
- Inventory Analytics
- Production Ready Architecture

[⬆ Back to Top](#top)

---

<a id="license"></a>

# License

This project was developed for academic purposes as part of the Software Project Development (2026) course.

[⬆ Back to Top](#top)
