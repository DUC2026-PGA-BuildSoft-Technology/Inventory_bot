INSERT INTO products (barcode, product_name, category, color, size, stock_quantity, price, status, image_url)
VALUES
  ('885001', 'Cotton T-Shirt', 'Clothing', 'Black', 'M', 24, 7.50, 'active', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'),
  ('885002', 'Denim Jeans', 'Clothing', 'Blue', '32', 8, 18.00, 'active', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'),
  ('885003', 'Sport Shoes', 'Footwear', 'White', '42', 4, 25.00, 'low_stock', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500')
ON CONFLICT (barcode) DO NOTHING;
