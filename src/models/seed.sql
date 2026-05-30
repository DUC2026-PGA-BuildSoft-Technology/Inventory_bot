INSERT INTO products (barcode, product_name, category, color, size, stock_quantity, price, status)
VALUES
  ('885001', 'Cotton T-Shirt', 'Clothing', 'Black', 'M', 24, 7.50, 'active'),
  ('885002', 'Denim Jeans', 'Clothing', 'Blue', '32', 8, 18.00, 'active'),
  ('885003', 'Sport Shoes', 'Footwear', 'White', '42', 4, 25.00, 'low_stock')
ON CONFLICT (barcode) DO NOTHING;
