const { calculateGST } = require("./gstCalc");

exports.calculateBill = (price, qty, gst, discount) => {
  const base = price * qty;

  let discountAmount = 0;
  if (discount) {
    discountAmount = (base * discount.discountPercent) / 100;
  }

  const taxable = base - discountAmount;

  let tax = { cgst: 0, sgst: 0, igst: 0, totalTax: 0, final: taxable };
  if (gst) {
    tax = calculateGST(taxable, gst);
  }

  return {
    base,
    discount: discountAmount,
    taxable,
    gst: tax.totalTax,
    final: tax.final,
    breakdown: tax,
  };
};
