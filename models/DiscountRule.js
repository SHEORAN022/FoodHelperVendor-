// const mongoose = require("mongoose");

// const schema = new mongoose.Schema({
//   product: { type: mongoose.Schema.Types.ObjectId, ref: "Price" },
//   minQty: Number,
//   maxQty: Number,
//   discountPercent: Number
// });

// module.exports = mongoose.model("DiscountRule", schema);

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Price",
    required: true
  },

  minQty: {
    type: Number,
    required: true
  },

  maxQty: {
    type: Number, // null = unlimited (6+)
    default: null
  },

  unitPrice: {
    type: Number, // 🔥 FINAL PRICE PER UNIT
    required: true
  }
});

module.exports = mongoose.model("DiscountRule", schema);
