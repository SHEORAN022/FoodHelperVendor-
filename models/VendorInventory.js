const mongoose = require("mongoose");

const vendorInventorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProduct",
      required: true,
      index: true,
    },

    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },

    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 5,
    },

    outOfStock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorInventory", vendorInventorySchema);
