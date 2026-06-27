require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedImages = async () => {
  try {
    console.log('Connecting to database to update product image URLs...');
    
    // Seed Cotton T-Shirt image
    await pool.query(
      `UPDATE products 
       SET image_url = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' 
       WHERE barcode = '885001'`
    );

    // Seed Denim Jeans image
    await pool.query(
      `UPDATE products 
       SET image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' 
       WHERE barcode = '885002'`
    );

    // Seed Sport Shoes image
    await pool.query(
      `UPDATE products 
       SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' 
       WHERE barcode = '885003'`
    );

    console.log('✅ Product image URLs successfully seeded in database!');
  } catch (err) {
    console.error('❌ Database error occurred:', err.message);
  } finally {
    await pool.end();
  }
};

seedImages();
