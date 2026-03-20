const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* ============================================================
   CREATE RAZORPAY ORDER
   Called when user clicks "Pay Now"
============================================================ */
exports.createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.isPaid)
      return res.status(400).json({ success: false, message: "Order already paid" });

    const amount = order.price * order.quantity;

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + order._id,
    });

    // Create transaction (pending)
    await Transaction.create({
      user: userId,
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      status: "pending",
    });

    res.json({
      success: true,
      razorpayOrder,
    });
  } catch (err) {
    console.error("Create Payment Order Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================================================
   VERIFY PAYMENT AFTER SUCCESS
============================================================ */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature",
      });
    }

    // Find transaction
    const txn = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!txn)
      return res.status(404).json({ success: false, message: "Transaction not found" });

    // Mark transaction paid
    txn.status = "paid";
    txn.razorpayPaymentId = razorpay_payment_id;
    txn.razorpaySignature = razorpay_signature;
    await txn.save();

    // Mark order paid
    await Order.findByIdAndUpdate(txn.order, {
      isPaid: true,
      status: "confirmed",
    });

    res.json({
      success: true,
      message: "Payment verified & order confirmed",
    });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================================================
   ADMIN: GET ALL PAYMENTS
============================================================ */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Transaction.find()
      .populate("user", "name email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments,
    });
  } catch (err) {
    console.error("Get Payments Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
