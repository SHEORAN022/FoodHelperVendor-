const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["hub", "warehouse", "store"],
      default: "hub",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    address: { type: String, default: "" },
    openingTime: { type: String, default: "06:00 AM" },
    closingTime: { type: String, default: "11:00 PM" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
