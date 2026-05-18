const Order = require("../models/Order");

/* ================= VENDOR ITEMS ================= */

const vendorItems = (order, vendorId) =>
  (order.items || [])
    .filter(
      (item) =>
        item.vendorId &&
        String(item.vendorId) === String(vendorId)
    )
    .map((item) => {
      const obj =
        typeof item.toObject === "function"
          ? item.toObject()
          : item;

      return {
        ...obj,

        // 🔥 Unit ensure
        unit: obj.unit || "pcs",

        // 🔥 Packaging text ensure
        packing:
          obj.packing ||
          obj.packagingText ||
          `${obj.quantity || 1} ${obj.unit || "pcs"}`,

        packagingText:
          obj.packagingText ||
          obj.packing ||
          `${obj.quantity || 1} ${obj.unit || "pcs"}`,

        // 🔥 Unit conversions ensure
        unitDefs: Array.isArray(obj.unitDefs)
          ? obj.unitDefs
          : [],
      };
    });

/* ================= VENDOR TOTAL ================= */

const vendorTotal = (items) =>
  items.reduce((sum, i) => sum + (i.price || 0), 0);

/* ================= GET VENDOR ORDERS ================= */

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id || req.vendor.id;

    const orders = await Order.find({
      "items.vendorId": vendorId,
    })
      .populate("user", "name phone email")
      .sort({ createdAt: -1 });

    const data = orders.map((order) => {
      const items = vendorItems(order, vendorId);

      const total = vendorTotal(items);

      return {
        _id: order._id,

        user: order.user,

        userName: order.userName,

        status: order.status,

        paymentMode: order.paymentMode,

        paymentStatus: order.paymentStatus,

        paidAmount: order.paidAmount || 0,

        paymentNote: order.paymentNote || "",

        address: order.address,

        totalPrice: total,

        items,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,
      };
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("getVendorOrders error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= GET ORDER BY ID ================= */

exports.getVendorOrderById = async (req, res) => {
  try {
    const vendorId = req.vendor._id || req.vendor.id;

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    }).populate("user", "name phone email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = vendorItems(order, vendorId);

    const total = vendorTotal(items);

    return res.json({
      success: true,

      data: {
        _id: order._id,

        user: order.user,

        userName: order.userName,

        status: order.status,

        paymentMode: order.paymentMode,

        paymentStatus: order.paymentStatus,

        paidAmount: order.paidAmount || 0,

        paymentNote: order.paymentNote || "",

        address: order.address,

        totalPrice: total,

        items,

        createdAt: order.createdAt,

        updatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    console.error("getVendorOrderById error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE STATUS ================= */

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const vendorId = req.vendor._id || req.vendor.id;

    // const allowed = [
    //   "placed",
    //   "confirmed",
    //   "accepted",
    //   "shipped",
    //   "delivered",
    //   "cancelled",
    // ];

    const allowed = [
  "pending",
  "accepted",
  "shipped",
  "delivered",
  "cancelled",
];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    const items = vendorItems(order, vendorId);

    const total = vendorTotal(items);

    return res.json({
      success: true,

      message: "Order status updated successfully",

      data: {
        _id: order._id,

        status: order.status,

        paymentStatus: order.paymentStatus,

        paidAmount: order.paidAmount || 0,

        totalPrice: total,

        items,
      },
    });
  } catch (err) {
    console.log("STATUS UPDATE ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE PAYMENT ================= */

exports.updatePayment = async (req, res) => {
  try {
    const { paidAmount, paymentNote } = req.body;

    const vendorId = req.vendor._id || req.vendor.id;

    if (paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "paidAmount is required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = vendorItems(order, vendorId);

    const total = vendorTotal(items);

    order.paidAmount = Math.min(
      Math.max(0, Number(paidAmount) || 0),
      total
    );

    if (paymentNote !== undefined) {
      order.paymentNote = paymentNote;
    }

    await order.save();

    return res.json({
      success: true,

      data: {
        paidAmount: order.paidAmount,

        paymentStatus: order.paymentStatus,

        paymentNote: order.paymentNote,
      },
    });
  } catch (err) {
    console.log("PAYMENT UPDATE ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE ORDER ITEMS ================= */

exports.updateOrderItems = async (req, res) => {
  try {
    const { items: updatedItems } = req.body;

    const vendorId = req.vendor._id || req.vendor.id;

    if (!Array.isArray(updatedItems) || updatedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items array required",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    }).populate("user", "name phone email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    updatedItems.forEach((upd) => {
      const idx = order.items.findIndex(
        (it) =>
          String(it.product) === String(upd.product) &&
          String(it.vendorId) === String(vendorId)
      );

      if (idx !== -1) {
        const qty = Math.max(1, Number(upd.quantity) || 1);

        order.items[idx].quantity = qty;

        order.items[idx].price = +(
          order.items[idx].unitPrice * qty
        ).toFixed(2);

        // 🔥 packaging auto update
        order.items[idx].packing =
          `${qty} ${order.items[idx].unit || "pcs"}`;

        order.items[idx].packagingText =
          `${qty} ${order.items[idx].unit || "pcs"}`;
      }
    });

    order.totalPrice = +order.items
      .reduce((s, i) => s + (i.price || 0), 0)
      .toFixed(2);

    if (order.paidAmount > order.totalPrice) {
      order.paidAmount = order.totalPrice;
    }

    await order.save();

    const items = vendorItems(order, vendorId);

    const total = vendorTotal(items);

    return res.json({
      success: true,

      message: "Order items updated",

      data: {
        _id: order._id,

        status: order.status,

        paymentStatus: order.paymentStatus,

        paidAmount: order.paidAmount || 0,

        paymentNote: order.paymentNote || "",

        totalPrice: total,

        items,

        user: order.user,

        address: order.address,

        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.log("UPDATE ITEMS ERROR =>", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

