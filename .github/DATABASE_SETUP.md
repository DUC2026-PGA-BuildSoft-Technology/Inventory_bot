# Database Setup Guide

## Neon DB Setup

### Step 1: Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Create a new project

### Step 2: Get Connection String
1. In Neon Dashboard, select your project
2. Go to "Connection strings"
3. Select "Node.js" driver
4. Copy the connection string
5. Replace the `password` placeholder with your actual password

### Step 3: Create Database Tables
1. Open your SQL Editor in Neon Dashboard
2. Copy the SQL from `DATABASE_SCHEMA.sql`
3. Execute the SQL to create the `users` table

### Step 4: Verify Connection
Run the health check:
```bash
curl http://localhost:3000/health/db
```

## Local PostgreSQL Setup (Alternative)

If using local PostgreSQL instead of Neon:

```bash
# Create database
createdb inventory_bot

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/inventory_bot

# Run schema
psql inventory_bot -f DATABASE_SCHEMA.sql
```

## Connection Troubleshooting

### SSL Certificate Error
```
Error: self signed certificate
```
**Solution**: Ensure `ssl: { rejectUnauthorized: false }` in `src/config/db.js`

### Connection Timeout
```
Error: connect ECONNREFUSED
```
**Solution**: Check that DATABASE_URL is correct and server is running

### Authentication Failed
```
Error: FATAL: database role does not have CONNECT privilege
```
**Solution**: Verify username and password in DATABASE_URL
