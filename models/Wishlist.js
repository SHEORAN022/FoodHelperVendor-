const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Price", // 🔥 priceModel ka model name
      required: true,
    },
  },
  { timestamps: true }
);

// same product duplicate na ho
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
