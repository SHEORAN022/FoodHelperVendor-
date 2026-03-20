const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    phone: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    role: {
      type: String,
      default: "vendor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
