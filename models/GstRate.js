
const mongoose = require("mongoose");

const gstSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Price", unique: true },
  hsnCode: String,
  gstPercent: Number,
  taxType: { type: String, enum: ["cgst_sgst", "igst"], default: "cgst_sgst" }
});

module.exports = mongoose.model("GstRate", gstSchema);
