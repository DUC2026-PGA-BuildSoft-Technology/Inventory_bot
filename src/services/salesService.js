const productService = require('./productService');
const { query } = require('../config/db');

const recordSale = async (barcode, quantity, userId) => {
  // Business logic wrapper for recording sales.
  return productService.recordSaleByBarcode(barcode, quantity, userId);
};

const getSalesReport = async (timeframe) => {
  let intervalFilter = 'CURRENT_DATE';
  if (timeframe === 'weekly') {
    intervalFilter = "CURRENT_DATE - INTERVAL '7 days'";
  } else if (timeframe === 'monthly') {
    intervalFilter = "CURRENT_DATE - INTERVAL '30 days'";
  }

  const sql = `
    SELECT 
      p.product_name, 
      p.category, 
      SUM(s.quantity)::integer as total_qty, 
      SUM(s.total_price)::numeric(10,2) as total_amount
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE s.sold_at >= ${intervalFilter}
    GROUP BY p.product_name, p.category
    ORDER BY total_amount DESC;
  `;
  const result = await query(sql);
  
  const totalSql = `
    SELECT COALESCE(SUM(total_price), 0)::numeric(10,2) as grand_total 
    FROM sales 
    WHERE sold_at >= ${intervalFilter};
  `;
  const totalResult = await query(totalSql);
  const grandTotal = totalResult.rows[0].grand_total;

  return {
    items: result.rows,
    grandTotal,
  };
};

const getTodaySalesReport = async () => {
  return getSalesReport('daily');
};

module.exports = { 
  recordSale,
  getTodaySalesReport,
  getSalesReport,
};
