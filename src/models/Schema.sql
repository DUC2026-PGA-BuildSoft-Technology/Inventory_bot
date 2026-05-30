-- ==========================================
-- Smart-Stock Inventory Bot Database Schema
-- PostgreSQL (Neon DB)
-- ==========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    color VARCHAR(100),
    size VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    shelf_location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    sold_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id
ON users(telegram_id);

CREATE INDEX IF NOT EXISTS idx_products_name
ON products(product_name);

CREATE INDEX IF NOT EXISTS idx_sales_product_id
ON sales(product_id);

-- Sample Products
INSERT INTO products
(product_name, category, color, size, stock_quantity, shelf_location)
VALUES
('Red XL Shirt', 'Garment', 'Red', 'XL', 50, 'A1'),
('Blue L Shirt', 'Garment', 'Blue', 'L', 35, 'A2'),
('USB Type-C Cable', 'Electronics', 'Black', 'N/A', 100, 'B1');

-- View Products
SELECT * FROM products;

-- View Users
SELECT * FROM users;

-- View Sales
SELECT * FROM sales;