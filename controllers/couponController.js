const Coupon = require("../models/couponModel");


exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getCoupons = async (req, res) => {
  try {
    const today = new Date();

    const coupons = await Coupon.find({
      status: "active",
      expiryDate: { $gte: today },
    });

    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= UPDATE ================= */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= DELETE ================= */
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= TOGGLE ================= */
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    coupon.status = coupon.status === "active" ? "inactive" : "active";
    await coupon.save();

    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= APPLY ================= */
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, cartValue } = req.body;

    const coupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
      status: "active",
    });

    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (new Date() > coupon.expiryDate)
      return res.status(400).json({ message: "Expired" });

    if (cartValue < coupon.minOrderValue)
      return res.status(400).json({
        message: `Min order ₹${coupon.minOrderValue}`,
      });

    let discount =
      coupon.discountType === "percentage"
        ? (cartValue * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    res.json({
      success: true,
      discount,
      finalAmount: cartValue - discount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};