# Smart-Stock Inventory Bot

### Live Staging Bot

https://t.me/SmartStockInventoryBot

Smart-Stock is a **Telegram-based inventory management system** that helps wholesale shops efficiently manage products, inventory, sales records, and administrators through a conversational interface.

Developed for the course **Software Project Development (2026)**, the system uses a **Telegram Bot**, **Node.js**, **Express.js**, and **PostgreSQL (Neon)** to provide a simple and efficient inventory management solution without requiring a web dashboard.

---

<a id="top"></a>

# Table of Contents

* [Project Summary](#project-summary)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [Architecture Overview](#architecture-overview)
* [Repository Structure](#repository-structure)
* [System Workflow](#system-workflow)
* [User Roles & Permissions](#user-roles--permissions)
* [Database Schema Overview](#database-schema-overview)
* [Requirements](#requirements)
* [Environment Configuration](#environment-configuration)
* [Installation](#installation)
* [Running the Project](#running-the-project)
* [Running Test Suite](#running-test-suite)
* [Telegram Bot Features](#telegram-bot-features)
* [Telegram Bot Commands](#telegram-bot-commands)
* [API Endpoints](#api-endpoints)
* [Development Notes](#development-notes)
* [Professional Project Highlights](#professional-project-highlights)
* [License](#license)

---

<a id="project-summary"></a>

# Project Summary

Smart-Stock is a Telegram-based inventory management platform that integrates multiple backend technologies into one system.

Main components:

* Telegram Bot
* Express.js REST API
* PostgreSQL (Neon)
* Inventory Management
* Sales Management

[⬆ Back to Top](#top)

---

<a id="key-features"></a>

# Key Features

## Inventory Management

* Conversational Product Wizard
* Product Registration
* Barcode Character Counter
* Inventory Control
* Product Search
* Product Update
* Product Deletion

## Sales Management

* Sales Recording
* Stock Adjustment
* Sales History
* Transaction Logs

## Telegram Bot

* Reply Keyboard
* Inline Keyboard
* Pagination
* Conversation Wizard
* Exchange Rate Lookup
* Input Validation
* Error Handling

[⬆ Back to Top](#top)

---

<a id="technology-stack"></a>

# Technology Stack

| Layer              | Technology        |
| ------------------ | ----------------- |
| Runtime            | Node.js           |
| Backend Framework  | Express.js        |
| Telegram Framework | Telegraf          |
| Database           | PostgreSQL (Neon) |
| API Style          | REST API          |
| Testing            | Mocha             |
| Version Control    | Git & GitHub      |

[⬆ Back to Top](#top)

---

<a id="architecture-overview"></a>

# Architecture Overview

```text
              Telegram User
                    │
                    ▼
             Telegram Bot
                    │
                    ▼
             Express Server
                    │
      ┌─────────────┼─────────────┐
      │             │             │
  Handlers      API Routes    Middleware
      │             │             │
      └─────────────┼─────────────┘
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
├── routes/
├── middleware/
├── models/
├── config/
├── services/
├── database/
├── tests/
├── package.json
├── package-lock.json
├── .env
└── README.md
```

[⬆ Back to Top](#top)

---

<a id="system-workflow"></a>

# System Workflow

1. User sends a command or message to the Telegram Bot.
2. Bot validates the received input.
3. Express.js receives the request.
4. Business logic processes the request.
5. PostgreSQL stores or retrieves data.
6. Bot formats the response.
7. User receives the updated inventory information.

[⬆ Back to Top](#top)

---

<a id="user-roles--permissions"></a>

# User Roles & Permissions

| Role          | Permissions                      |
| ------------- | -------------------------------- |
| Owner         | Full System Access               |
| Stock Manager | Product & Inventory Management   |
| Seller        | Sales Recording & Product Lookup |

[⬆ Back to Top](#top)

---

<a id="database-schema-overview"></a>

# Database Schema Overview

Main Tables

* Users
* Products
* Categories
* Inventory
* Sales
* HistoryLogs

Relationships

```text
Users
   │
Products
   │
Inventory
   │
Sales
   │
HistoryLogs
```

[⬆ Back to Top](#top)

---

<a id="requirements"></a>

# Requirements

* Node.js 20+
* PostgreSQL Database (Neon)
* Telegram Bot Token
* npm

[⬆ Back to Top](#top)

---

<a id="environment-configuration"></a>

# Environment Configuration

Create a `.env` file.

```env
BOT_TOKEN=

DATABASE_URL=

PORT=3000
```

[⬆ Back to Top](#top)

---

<a id="installation"></a>

# Installation

Clone the repository.

```bash
git clone <repository-url>

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

<a id="running-test-suite"></a>

# Running Test Suite

```bash
npm test
```

[⬆ Back to Top](#top)

---

<a id="telegram-bot-features"></a>

# Telegram Bot Features

* Product Management
* Inventory Monitoring
* Sales Recording
* Product Search
* Category Management
* User Authentication
* Transaction History
* Reply Keyboard Navigation
* Inline Button Navigation
* Input Validation
* Error Handling

[⬆ Back to Top](#top)

---

<a id="telegram-bot-commands"></a>

# Telegram Bot Commands

| Command      | Description              |
| ------------ | ------------------------ |
| /start       | Start the Bot            |
| /menu        | Main Menu                |
| /catalog     | View Product Catalog     |
| /add_product | Add a New Product        |
| /inventory   | View Inventory           |
| /sales       | Record Sales             |
| /history     | View Transaction History |
| /profile     | View User Profile        |
| /exchange    | Currency Exchange Rate   |

[⬆ Back to Top](#top)

---

<a id="api-endpoints"></a>

# API Endpoints

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | /health       | Health Check      |
| GET    | /products     | Get All Products  |
| GET    | /products/:id | Get Product by ID |
| POST   | /products     | Create Product    |
| PUT    | /products/:id | Update Product    |
| DELETE | /products/:id | Delete Product    |
| POST   | /sales        | Record Sale       |

[⬆ Back to Top](#top)

---

<a id="development-notes"></a>

# Development Notes

* Modular Architecture
* MVC Design Pattern
* RESTful API Design
* Conversation-Based Telegram Bot
* Input Validation
* Centralized Error Handling
* PostgreSQL Data Persistence
* Unit Testing with Mocha
* Clean Code Principles

[⬆ Back to Top](#top)

---

<a id="professional-project-highlights"></a>

# Professional Project Highlights

* Telegram-Based Inventory Management
* Conversational User Experience
* Express.js REST API
* PostgreSQL (Neon) Database
* Modular Project Architecture
* MVC Design Pattern
* Role-Based Access Control
* Transaction History Logging
* Production-Oriented Folder Structure
* Automated Testing with Mocha

[⬆ Back to Top](#top)

---

<a id="license"></a>

# License

This project was developed for academic purposes as part of the **Software Project Development (2026)** course.

© 2026 Smart-Stock Inventory Bot Project Team.

[⬆ Back to Top](#top)
