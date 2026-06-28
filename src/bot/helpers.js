const parseCommandArgs = (ctx) => {
  const text = ctx.message && ctx.message.text ? ctx.message.text : '';
  return text.trim().split(/\s+/).slice(1);
};

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const formatProductLine = (product, index) => {
  const details = [product.category, product.color, product.size].filter(Boolean).join(' | ');
  const detailText = details ? `\n ├ 📐 Specs: ${details}` : '';
  const statusEmoji = product.stock_quantity <= 5 ? ' ⚠️' : '';

  return [
    `📦 <b>${product.product_name}</b>`,
    ` ├ Barcode: <code>${product.barcode}</code> (${product.barcode.length} characters)`,
    detailText ? ` ├ Specs: ${details}` : '',
    ` └ Price: ${formatMoney(product.price)} | Stock: ${product.stock_quantity} units${statusEmoji} (${product.status})`,
    `━━━━━━━━━━━━━━━━━━`,
  ].filter(Boolean).join('\n');
};

module.exports = {
  parseCommandArgs,
  formatMoney,
  formatProductLine,
};
