# Smart-Stock Inventory Bot

### Live Staging Bot: [@SmartStockInventoryBot](https://t.me/SmartStockInventoryBot)

Smart-Stock is a full-stack inventory management system that combines a **Telegram Bot**, a **Responsive Web Dashboard**, **Cloudinary-powered image management**, and a **PostgreSQL (Neon)** backend into one integrated solution.

Developed for the course Software Project Development (2026), it is designed for wholesale shops in Orussey Market to efficiently manage products, inventory, sales, and administrators.

---

<a id="top"></a>

#  Table of Contents

* [ Project Summary](#-project-summary)
* [ Key Features](#-key-features)
* [ Technology Stack](#-technology-stack)
* [ Architecture Overview](#-architecture-overview)
* [ Repository Structure](#-repository-structure)
* [ System Workflow](#-system-workflow)
* [ User Roles & Permissions](#-user-roles--permissions)
* [ Database Schema Overview](#-database-schema-overview)
* [ Requirements](#-requirements)
* [ Environment Configuration](#-environment-configuration)
* [ Installation](#-installation)
* [ Running the Project](#-running-the-project)
* [ Running Staging Test Suite](#-running-staging-test-suite)
* [ Web Dashboard Features](#-web-dashboard-features)
* [ Telegram Bot Commands](#-telegram-bot-commands)
* [ API Endpoints](#-api-endpoints)
* [ Development Notes](#-development-notes)
* [ Professional Project Highlights](#-professional-project-highlights)
* [ License](#-license)

---

# Project Summary

Smart-Stock integrates several technologies into a complete inventory platform:
* **Telegram Bot** for mobile, conversational access.
* **Responsive Web Dashboard** for centralized administrative operations.
* **Cloudinary** for image storage and management.
* **PostgreSQL (Neon Database)** for relational data persistence.

[ Back to Top](#top)

---

# Key Features

### Product & Stock Management
* **Conversational Wizard**: Step-by-step product creation flow (`/add_product`) with validation, `/skip` (or `-`) skipping, and cancelling steps.
* **Barcode Character Counting**: Display length of barcode inputs (e.g. `885001 (6 characters)`) across views.
* **Inventory Control**: Update stock quantities, manage statuses (Active, Low Stock, Out of Stock). Low Stock is defined as stock quantity <= 5.
* **Cloudinary Image Upload**: Upload and display product images on the web dashboard.

### Sales & Reporting
* **Sales Recording**: Log sales transactions, which automatically deducts quantity from inventory.
* **Role-Based History Logs**: Customized audit trails for Sellers (checkouts), Stock Managers (adjustments), and Owners (global actions).
* **ERP-Grade Stock Audit Reports**: Timeframe lists of Intakes, Outflows, New Product registrations, Specification Updates, Deletions, and Low Stock Alerts.

### Telegram Interface & UX
* **Dynamic Navigation Layouts**: Persistent bottom Reply Keyboard (`Main Menu`, `View Catalog`, `History`, `Profile`).
* **Interactive Catalog Pagination**: Shows a clean **5 products per page** view with dynamic `Prev` and `Next` inline keyboard navigation buttons.
* **Single-Message Interactive Dashboards**: Main Menu dashboard card for clean navigation.
* **Exchange Rate Lookups**: Real-time USD  KHR conversion using `/exchange`.
* **Zero-Crash Staging Compliance**: Complete input parameter sanitization and exception fallback handlers.

[ Back to Top](#top)

---

# Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js | Server Execution Environment |
| **Web Server** | Express.js | API Endpoints & Health Checks |
| **Telegram Bot** | Telegraf | Bot API Framework |
| **Database** | PostgreSQL | Relational Storage (Neon DB) |
| **Image Storage** | Cloudinary | Cloud Image Hosting |
| **Frontend UI** | HTML / CSS / JS | Web Dashboard Interface |
| **Testing Suite** | Mocha / Assert | Technical Audit Test Suite |

[ Back to Top](#top)

---

# Architecture Overview

The project follows a modular architecture to improve maintainability and scalability.

```text
                   Client
                      
      
                                     
 Telegram Bot                  Web Dashboard
                                     
      
                      
                 Express Server
                      
      
                                    
   Handlers       Services        API Routes
                     
      
              Business Logic
                      
                  Data Models
                      
              PostgreSQL (Neon)
```

[ Back to Top](#top)

---

# Repository Structure

```text
Inventory_bot/
 dashboard/
    index.html
    script.js
    styles.css
 src/
    bot/
       bot.js            # Telegraf initialization
       helpers.js        # Formatting helpers & catalog formatting
    config/
       db.js             # Database connections
    handlers/             # Telegram interaction controllers
       catalog/          # Live product catalog commands
       exchange/         # Currency API queries
       help/             # Commands guidelines & shortcuts
       menu/             # Keyboard & dashboard controllers
       sell/             # Checkout sales flow
       start/            # Unified entry dashboard card
       stock/            # Product Wizards & adjustments
    models/               # Direct database parameterized queries
       productModel.js
       userModel.js
       Schema.sql
       seed.sql
    services/             # Business rules & report calculations
       productService.js
       stockService.js
       salesService.js
       userService.js
    app.js
    server.js
 tests/                    # Zero-dependency Technical Staging Audit Suite
    mocks.js              # Mock query intercepts
    unit.test.js          # Unit tests
    integration.test.js   # Integration tests
    e2e.test.js           # End-to-end tests
    run.js                # Test runner
 package.json
 README.md
```

[ Back to Top](#top)

---

#  System Workflow

## Overall Application Flow

```
User Interaction
    

   Telegram Bot / Web Dashboard      
  (User Input & Interface Layer)     

                 

   Handlers & Controllers            
  (Request Processing & Validation)  

                 

   Services Layer                    
  (Business Logic & Rules)           

                 

   Models & Database Access          
  (Data Persistence)                 

                 
        PostgreSQL (Neon DB)
```

### Key Workflow Steps

| Step | Component | Action |
| :--- | :--- | :--- |
| 1 | **Telegram/Dashboard** | User sends command or HTTP request |
| 2 | **Handlers** | Route request & extract parameters |
| 3 | **Services** | Execute business logic & validation |
| 4 | **Models** | Generate parameterized SQL queries |
| 5 | **Database** | Execute query & return result |
| 6 | **Services** | Format/aggregate response data |
| 7 | **Handlers** | Format response for UI |
| 8 | **User Interface** | Display result to user |

[ Back to Top](#top)

---

# User Roles & Permissions

| Role | Access Level | Key Permissions |
| :--- | :--- | :--- |
| **Owner** | Full Admin | View all reports, manage users, view global sales & stock audits |
| **Stock Manager** | Inventory Control | Add products, update stock, view stock logs, manage stock adjustments |
| **Seller** | Sales Only | Record sales transactions, view catalog, check stock, view personal sales history |
| **Customer** | Read Only | View product catalog, check prices, view exchange rates |

### Role-Based Access Control Workflow

```
User Request
    
Verify User Role
    
Check Permission Matrix
    
 Permission Granted  Execute Action
 Permission Denied   Return Error Message
```

[ Back to Top](#top)

---

# Database Schema Overview

## Core Tables

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| **users** | User authentication & roles | id, telegram_id, role, status, created_at |
| **products** | Product catalog | id, barcode, name, category, price, image_url |
| **stock** | Inventory tracking | id, product_id, quantity, status, last_updated |
| **sales** | Transaction records | id, product_id, user_id, quantity, amount, timestamp |
| **stock_logs** | Inventory change audit trail | id, product_id, action, quantity_change, user_id, timestamp |
| **notifications** | System notifications | id, user_id, message, type, is_read, created_at |

## Table Relationships

```
users (1) 
                  
                   (M) sales
                  
                   (M) stock_logs

products (1) 
                 
                  (M) stock
                 
                  (M) sales
                 
                  (M) stock_logs
```

## Data Flow for Sales Transaction

```
Sale Request (barcode, qty, user_id)
    

 Validate Product Exists    
 Check Stock Availability   
 Verify User Permissions    

             
    All Validations Pass
             

 Create Sales Record        
 Deduct Stock Quantity      
 Create Stock Log Entry     
 Calculate Totals/Reports   

             
    Return Success with Receipt
```

[ Back to Top](#top)

---

#  Requirements

* Node.js 14+
* PostgreSQL (Neon recommended)
* Telegram Bot Token
* Cloudinary Account

[ Back to Top](#top)

---

# Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Configure the variables:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

[ Back to Top](#top)

---

# Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd Inventory_bot
npm install
```

### 2. Initialize Database Tables
```bash
psql "$DATABASE_URL" -f src/models/Schema.sql
psql "$DATABASE_URL" -f src/models/seed.sql
```

[ Back to Top](#top)

---

# Running the Project

### Development Mode (with hot-reloads)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```
The dashboard will be available at `http://127.0.0.1:3000`.

[ Back to Top](#top)

---

# Running Staging Test Suite

The repository contains a test suite to audit stability and verify all conversational wizards, negative validations, role-based controls, and database aggregate helper behaviors:
```bash
npm test
```

[ Back to Top](#top)

---

# Web Dashboard Features

* View entire product catalog.
* Upload and change product images.
* Create, edit, and delete products.
* Real-time monitoring of stock levels.
* Account management (Sellers & Managers).
* View sales performance & store statistics.

[ Back to Top](#top)

---

# Telegram Bot Commands

| Command | Description |
| :--- | :--- |
| `/start` | Unified entry card with role-specific menu actions. |
| `/help` | Guidelines on command usages and shortcuts list. |
| `/menu` | Display command dashboard menu. |
| `/view_catalog` | List all products with specs, stock quantities, and details. |
| `/check_stock [barcode]` | Inspect inventory details of a specific barcode. |
| `/sell [barcode] [qty]` | Record sales and deduct stock from the catalog. |
| `/update_stock [barcode] [qty]`| Direct stock increment or reduction. |
| `/add_product` | Launch the conversational wizard to add a new catalog item. |
| `/owner_report` | View timeframe daily, weekly, or monthly Sales and Stock Audit logs. |
| `/manage_users` | View user profiles, ban/unban members, or promote roles. |
| `/exchange` | Get the current USD to KHR currency exchange rate. |

[ Back to Top](#top)

---

#  API Endpoints

## Dashboard API Routes

### Products API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products |
| `GET` | `/api/products/:id` | Fetch product by ID |
| `POST` | `/api/products` | Create new product |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product |
| `POST` | `/api/products/:id/image` | Upload product image to Cloudinary |

### Sales API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sales` | Get all sales transactions |
| `GET` | `/api/sales/:id` | Get sales by ID |
| `POST` | `/api/sales` | Record new sale |
| `GET` | `/api/sales/user/:userId` | Get user's sales history |

### Stock API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stock` | Get all stock levels |
| `GET` | `/api/stock/:productId` | Get stock for product |
| `PUT` | `/api/stock/:productId` | Update stock quantity |
| `GET` | `/api/stock/logs/:productId` | Get stock change logs |

### Users API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get user profile |
| `PUT` | `/api/users/:id` | Update user role/status |
| `DELETE` | `/api/users/:id` | Ban/deactivate user |

### Reports API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports/sales` | Sales report (timeframe filter) |
| `GET` | `/api/reports/stock` | Stock audit report |
| `GET` | `/api/reports/low-stock` | Low stock alert report |

### System API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/exchange` | Get USD to KHR exchange rate |

[ Back to Top](#top)

---

# Development Notes

* `src/app.js` defines all dashboard API endpoints.
* `src/server.js` boots up the main Express server.
* `src/config/db.js` handles pool connections to PostgreSQL.
* `dashboard/` contains the dashboard HTML/CSS/JS frontend files.
* The dashboard can operate independently even if the Telegram Bot Token is missing.

### File-by-File Responsibilities

| File | Purpose | Dependencies |
| :--- | :--- | :--- |
| `src/bot/bot.js` | Initialize Telegraf bot & register handlers | Handlers, Config |
| `src/bot/helpers.js` | Format messages, catalog display, pagination | Telegram API |
| `src/config/db.js` | PostgreSQL connection pooling | pg library |
| `src/handlers/*/` | Handle specific commands & workflows | Services |
| `src/services/` | Business logic, calculations, validations | Models |
| `src/models/` | Direct database parameterized queries | PostgreSQL |
| `dashboard/` | Web UI for inventory management | Express server |
| `tests/` | Unit, integration, e2e test suite | Mocha, Assert |

### Development Workflow

```
Code Change
    
Run Tests (npm test)
    
 Tests Pass  Review Code
                      
              Stage & Commit Changes
                      
              Create Pull Request
                      
 Tests Fail  Debug & Fix
                       
                   Repeat Testing
```

### Debugging Tips

1. **Database Connections**: Check `process.env.DATABASE_URL` in `.env`
2. **Telegram Bot Issues**: Verify `TELEGRAM_BOT_TOKEN` is valid
3. **Image Upload Issues**: Confirm Cloudinary credentials in environment
4. **Test Failures**: Run `npm test` with detailed output for stack traces
5. **Port Conflicts**: Ensure port 3000 is available or update `.env`

[ Back to Top](#top)

---

# Professional Project Highlights

## Architecture & Code Quality

| Highlight | Description |
| :--- | :--- |
| **Clean Modular Architecture** | Clean decoupling of handlers, services, and models |
| **Separation of Concerns** | Each layer has specific responsibilities |
| **DRY Principle** | Reusable helpers, services, and utility functions |
| **Parameterized SQL** | Protection against SQL injection attacks |
| **Error Handling** | Comprehensive try-catch blocks & fallback handlers |

## Features & Functionality

| Feature | Description |
| :--- | :--- |
| **Robust Conversational State Machine** | Telegraf wizards for multi-step product creation flows |
| **PostgreSQL Performance** | Optimized queries with proper indexing |
| **Real-time Stock Management** | Instant inventory updates across platforms |
| **Role-Based Access Control** | Fine-grained permission system |
| **Comprehensive Audit Trails** | Complete stock_logs for compliance |
| **Cloudinary Integration** | Seamless cloud image management |

## Testing & Reliability

| Aspect | Coverage |
| :--- | :--- |
| **Unit Tests** | Core service functions & data transformations |
| **Integration Tests** | API endpoint behavior & database interactions |
| **End-to-End Tests** | Complete user workflows from UI to database |
| **Test Coverage** | Critical business logic paths verified |
| **Zero-Crash Compliance** | Input sanitization & exception handlers throughout |

[ Back to Top](#top)

---

# License

This project is licensed under the **MIT License**.
