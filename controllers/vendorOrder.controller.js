// const Order = require("../models/Order");

// exports.getVendorOrders = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;

//     const orders = await Order.find({
//       "items.vendorId": vendorId
//     })
//       .populate("user", "name phone")
//       .sort({ createdAt: -1 });

//     const data = orders.map(order => {
//       const items = order.items.filter(
//         item => item.vendorId && String(item.vendorId) === String(vendorId)
//       );

//       return {
//         _id: order._id,
//         user: order.user,
//         userName: order.userName,
//         status: order.status,
//         paymentMode: order.paymentMode,
//         totalPrice: items.reduce((sum, i) => sum + i.price, 0),
//         items,
//         createdAt: order.createdAt
//       };
//     });

//     res.json({
//       success: true,
//       count: data.length,
//       data
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const vendorId = req.vendor.id;

//     const allowed = ["accepted", "shipped", "delivered", "cancelled"];

//     if (!allowed.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status"
//       });
//     }

//     const order = await Order.findOne({
//       _id: req.params.id,
//       "items.vendorId": vendorId
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found"
//       });
//     }

//     const isMixed = order.items.some(
//       item => item.vendorId && String(item.vendorId) !== String(vendorId)
//     );

//     if (isMixed) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot update mixed vendor order"
//       });
//     }

//     order.status = status;
//     await order.save();

//     res.json({
//       success: true,
//       data: order
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


const Order = require("../models/Order");

/* ─── Helper: filter items for this vendor ─── */
const vendorItems = (order, vendorId) =>
  (order.items || []).filter(
    (item) => item.vendorId && String(item.vendorId) === String(vendorId)
  );

/* ─── Helper: compute vendor total ─── */
const vendorTotal = (items) =>
  items.reduce((sum, i) => sum + (i.price || 0), 0);

/* ─────────────────────────────────────────────
   GET  /api/vendor/orders
   Returns all orders that contain this vendor's items.
   Each order is scoped to only show vendor's items + correct totalPrice.
───────────────────────────────────────────── */
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const orders = await Order.find({ "items.vendorId": vendorId })
      .populate("user", "name phone email")
      .sort({ createdAt: -1 });

    const data = orders.map((order) => {
      const items = vendorItems(order, vendorId);
      const total = vendorTotal(items);

      return {
        _id:           order._id,
        user:          order.user,
        userName:      order.userName,
        status:        order.status,
        paymentMode:   order.paymentMode,
        paymentStatus: order.paymentStatus,
        paidAmount:    order.paidAmount   || 0,
        paymentNote:   order.paymentNote  || "",
        address:       order.address,
        totalPrice:    total,
        items,
        createdAt:     order.createdAt,
        updatedAt:     order.updatedAt,
      };
    });

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("getVendorOrders error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET  /api/vendor/orders/:id
   Single order detail (vendor scoped)
───────────────────────────────────────────── */
exports.getVendorOrderById = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    }).populate("user", "name phone email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const items = vendorItems(order, vendorId);
    const total = vendorTotal(items);

    return res.json({
      success: true,
      data: {
        _id:           order._id,
        user:          order.user,
        userName:      order.userName,
        status:        order.status,
        paymentMode:   order.paymentMode,
        paymentStatus: order.paymentStatus,
        paidAmount:    order.paidAmount   || 0,
        paymentNote:   order.paymentNote  || "",
        address:       order.address,
        totalPrice:    total,
        items,
        createdAt:     order.createdAt,
        updatedAt:     order.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUT  /api/vendor/orders/:id/status
   Vendor can update: pending → accepted → shipped → delivered | cancelled
───────────────────────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendorId   = req.vendor.id;

    const allowed = ["pending", "accepted", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    const items = vendorItems(order, vendorId);
    const total = vendorTotal(items);

    return res.json({
      success: true,
      data: {
        _id:           order._id,
        status:        order.status,
        paymentStatus: order.paymentStatus,
        paidAmount:    order.paidAmount || 0,
        totalPrice:    total,
        items,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUT  /api/vendor/orders/:id/payment
   Update paidAmount + paymentNote for this order.
   paymentStatus auto-computed via Order pre-save hook.
───────────────────────────────────────────── */
exports.updatePayment = async (req, res) => {
  try {
    const { paidAmount, paymentNote } = req.body;
    const vendorId = req.vendor.id;

    if (paidAmount === undefined)
      return res.status(400).json({ success: false, message: "paidAmount is required" });

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    });

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Scope totalPrice to vendor items only for cap
    const items = vendorItems(order, vendorId);
    const total = vendorTotal(items);

    order.paidAmount = Math.min(Math.max(0, Number(paidAmount) || 0), total);
    if (paymentNote !== undefined) order.paymentNote = paymentNote;

    await order.save(); // pre-save hook sets paymentStatus

    return res.json({
      success: true,
      data: {
        paidAmount:    order.paidAmount,
        paymentStatus: order.paymentStatus,
        paymentNote:   order.paymentNote,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUT  /api/vendor/orders/:id/items
   Vendor can edit item quantities (their items only).
   NOTE: stock adjustment is handled by admin controller.
         Vendor only adjusts price totals here.
───────────────────────────────────────────── */
exports.updateOrderItems = async (req, res) => {
  try {
    const { items: updatedItems } = req.body;
    const vendorId = req.vendor.id;

    if (!Array.isArray(updatedItems) || updatedItems.length === 0)
      return res.status(400).json({ success: false, message: "items array required" });

    const order = await Order.findOne({
      _id: req.params.id,
      "items.vendorId": vendorId,
    }).populate("user", "name phone email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Map updated quantities onto vendor items
    updatedItems.forEach((upd) => {
      const idx = order.items.findIndex(
        (it) => String(it.product) === String(upd.product) &&
                String(it.vendorId) === String(vendorId)
      );
      if (idx !== -1) {
        const qty = Math.max(1, Number(upd.quantity) || 1);
        order.items[idx].quantity = qty;
        order.items[idx].price    = +(order.items[idx].unitPrice * qty).toFixed(2);
      }
    });

    // Recalculate totalPrice (all items, not just vendor)
    order.totalPrice = +order.items
      .reduce((s, i) => s + (i.price || 0), 0)
      .toFixed(2);

    // Cap paidAmount
    if (order.paidAmount > order.totalPrice)
      order.paidAmount = order.totalPrice;

    await order.save();

    const items = vendorItems(order, vendorId);
    const total = vendorTotal(items);

    return res.json({
      success: true,
      message: "Order items updated",
      data: {
        _id:           order._id,
        status:        order.status,
        paymentStatus: order.paymentStatus,
        paidAmount:    order.paidAmount || 0,
        paymentNote:   order.paymentNote || "",
        totalPrice:    total,
        items,
        user:          order.user,
        address:       order.address,
        createdAt:     order.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};