const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Price", required: true },

  sku: String,
  hsnCode: String,

  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0 },

  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },

  gstPercent: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Inventory", inventorySchema);
