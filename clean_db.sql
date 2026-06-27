-- Smart-Stock Inventory Bot
-- Database Cleanup Script (Test Debris Removal)
-- Use this script to clear test transactions and prepare the DB for the Live Staging Audit.

BEGIN;

-- Truncate sales, logs, notifications, and users tables, resetting auto-incrementing primary key IDs
TRUNCATE TABLE sales, stock_logs, notifications, users RESTART IDENTITY CASCADE;

COMMIT;

-- Note: The products table catalog items remain unchanged. 
-- To re-seed product items, run: psql "$DATABASE_URL" -f src/models/seed.sql
