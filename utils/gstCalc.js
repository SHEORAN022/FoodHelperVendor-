exports.calculateGST = (amount, gst) => {
  const tax = (amount * gst.gstPercent) / 100;

  if (gst.taxType === "cgst_sgst") {
    return {
      cgst: tax / 2,
      sgst: tax / 2,
      igst: 0,
      totalTax: tax,
      final: amount + tax,
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: tax,
      totalTax: tax,
      final: amount + tax,
    };
  }
};
