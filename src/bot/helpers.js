const parseCommandArgs = (ctx) => {
  const text = ctx.message && ctx.message.text ? ctx.message.text : '';
  return text.trim().split(/\s+/).slice(1);
};

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const formatProductLine = (product, index) => {
  const details = [product.category, product.color, product.size].filter(Boolean).join(' / ');
  const detailText = details ? `\n   ${details}` : '';

  return `${index + 1}. ${product.product_name}${detailText}\n   Barcode: ${product.barcode} | Stock: ${product.stock_quantity} | Price: ${formatMoney(product.price)} | Status: ${product.status}`;
};

module.exports = {
  parseCommandArgs,
  formatMoney,
  formatProductLine,
};
