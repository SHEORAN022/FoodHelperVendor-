const Price = require("../models/priceModel");
const GstRate = require("../models/GstRate");
const DiscountRule = require("../models/DiscountRule");
const { calculateBill } = require("../utils/billingEngine");

exports.checkout = async (req, res) => {
  const cart = req.body.cart; // [{ productId, qty }]

  let total = 0;
  const items = [];

  for (const c of cart) {
    const product = await Price.findById(c.productId);
    const gst = await GstRate.findOne({ product: product._id });
    const discount = await DiscountRule.findOne({
      product: product._id,
      minQty: { $lte: c.qty },
      maxQty: { $gte: c.qty },
    });

    const bill = calculateBill(product.salePrice, c.qty, gst, discount);

    total += bill.final;

    items.push({
      name: product.name,
      qty: c.qty,
      base: bill.base,
      discount: bill.discount,
      gst: bill.gst,
      final: bill.final,
    });
  }

  res.json({ success: true, items, total });
};
