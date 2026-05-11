const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  headline: String,

  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },

  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    default: "percentage",
  },

  discountValue: Number,

  minOrderValue: Number,
  maxDiscount: Number,

  expiryDate: Date,

  dataPoints: [String],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

module.exports = mongoose.model("Coupon", couponSchema);