const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Price",
      required: true,
    },

    productName: String,

    action: {
      type: String,
      enum: ["create", "update", "daily-diff", "delete", "copy", "status-change"],
      required: true,
    },

    oldData: Object,
    newData: Object,

    changedBy: {
      type: String,
      default: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceHistory", priceHistorySchema);
