const Wishlist = require("../models/Wishlist");
const Price = require("../models/priceModel");

/* ================= ADD TO WISHLIST ================= */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    // 🔍 product exists check
    const product = await Price.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const exists = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: userId,
      product: productId,
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (err) {
    console.error("Wishlist add error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET WISHLIST ================= */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.find({ user: userId })
      .populate("product") // 🔥 priceModel populate
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: wishlist.length,
      data: wishlist,
    });
  } catch (err) {
    console.error("Wishlist get error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= REMOVE FROM WISHLIST ================= */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const removed = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    console.error("Wishlist remove error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
