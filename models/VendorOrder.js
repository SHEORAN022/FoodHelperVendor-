const mongoose = require("mongoose");

/* ================= ORDER ITEM ================= */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorProduct",
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
});

/* ================= VENDOR ORDER ================= */
const vendorOrderSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "delivered", "cancelled"],
      default: "pending",
    },

    paymentMode: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorOrder", vendorOrderSchema);
