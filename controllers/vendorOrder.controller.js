const VendorOrder = require("../models/VendorOrder");

/* ======================================================
   CREATE ORDER (TEST / USER SIDE)
====================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { vendor, user, items, paymentMode } = req.body;

    if (!vendor || !user || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await VendorOrder.create({
      vendor,
      user,
      items,
      totalAmount,
      paymentMode: paymentMode || "cod",
    });

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   GET VENDOR ORDERS
====================================================== */
exports.getVendorOrders = async (req, res) => {
  try {
    const orders = await VendorOrder.find({
      vendor: req.vendor.id,
    })
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ getVendorOrders error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   UPDATE ORDER STATUS (VENDOR)
====================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
