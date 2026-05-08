
const Order = require("../models/Order");
const Price = require("../models/priceModel");
const VendorProduct = require("../models/vendorProduct");
const User = require("../models/User");
const Rider = require("../models/Rider");
const Inventory = require("../models/Inventory");
const Ledger = require("../models/Inventoryledger");

const deductStock = async (items, orderId, note = "Order placed") => {
  for (const item of items) {
    const inv = await Inventory.findOne({ product: item.product });
    if (!inv) continue;
    inv.stock = Math.max(0, inv.stock - item.quantity);
    await inv.save();
    await Ledger.create({
      product: item.product,
      type: "OUTWARD",
      qty: item.quantity,
      note: `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`
    });
  }
};

const restoreStock = async (items, orderId, note = "Order cancelled") => {
  for (const item of items) {
    const inv = await Inventory.findOne({ product: item.product });
    if (!inv) continue;
    inv.stock = inv.stock + item.quantity;
    await inv.save();
    await Ledger.create({
      product: item.product,
      type: "INWARD",
      qty: item.quantity,
      note: `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`
    });
  }
};

const resolveItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0)
    throw { status: 400, message: "Items array required aur empty nahi hona chahiye" };

  const resolved = await Promise.all(
    rawItems.map(async (it, idx) => {
      if (!it.productId)
        throw { status: 400, message: `Item ${idx + 1}: productId missing hai` };

      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1)
        throw { status: 400, message: `Item ${idx + 1}: quantity valid nahi hai (min 1)` };

      let product;
      let ownerType;
      let vendorId = null;
      let productModel;

      if (it.type === "admin") {
        product = await Price.findById(it.productId);
        ownerType = "admin";
        productModel = "Price";
      } else if (it.type === "vendor") {
        product = await VendorProduct.findById(it.productId);
        ownerType = "vendor";
        productModel = "VendorProduct";
        vendorId = product?.vendor;
      } else {
        throw { status: 400, message: `Item ${idx + 1}: type invalid hai` };
      }

      if (!product)
        throw { status: 404, message: `Product nahi mila: ${it.productId}` };

      if (product.status !== "active")
        throw { status: 400, message: `Product active nahi hai: ${product.name}` };

      const unitPrice = product.salePrice || product.price;

      return {
        product: product._id,
        name: product.name,
        image: product.image || "",
        unitPrice,
        quantity: qty,
        price: +(unitPrice * qty).toFixed(2),
        ownerType,
        vendorId,
        productModel
      };
    })
  );

  const totalPrice = +resolved.reduce((sum, i) => sum + i.price, 0).toFixed(2);
  return { resolved, totalPrice };
};

exports.createOrder = async (req, res) => {
  try {
    const { items, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const { resolved, totalPrice } = await resolveItems(items);

    const order = await Order.create({
      user: user._id,
      userName: user.name || user.email,
      items: resolved,
      totalPrice,
      address,
      paidAmount: 0,
      paymentStatus: "unpaid"
    });

    await deductStock(resolved, order._id);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ success: false, message: err.message });

    return res.status(500).json({
      success: false,
      message: "Order place karna fail ho gaya"
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const prevStatus = order.status;

    if (status === "cancelled" && prevStatus !== "cancelled")
      await restoreStock(order.items, order._id);

    if (prevStatus === "cancelled" && status !== "cancelled")
      await deductStock(order.items, order._id);

    order.status = status;
    await order.save();

    return res.json({ success: true, data: order });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Status update fail ho gaya" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch {
    return res.status(500).json({ success: false, message: "Fetch fail" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch {
    return res.status(500).json({ success: false, message: "Fetch fail" });
  }
};

exports.assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;

    if (riderId) {
      const rider = await Rider.findById(riderId);
      if (!rider)
        return res.status(404).json({ success: false, message: "Rider not found" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedRider: riderId || null },
      { new: true }
    );

    return res.json({ success: true, data: order });

  } catch {
    return res.status(500).json({ success: false, message: "Assign fail" });
  }
};

exports.updateOrderItems = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const oldItems = order.items;
    const { resolved, totalPrice } = await resolveItems(req.body.items);

    if (order.status !== "cancelled") {
      await restoreStock(oldItems, order._id);
      await deductStock(resolved, order._id);
    }

    order.items = resolved;
    order.totalPrice = totalPrice;

    if (order.paidAmount > totalPrice)
      order.paidAmount = totalPrice;

    await order.save();

    return res.json({
      success: true,
      message: "Order updated",
      data: order
    });

  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ success: false, message: err.message });

    return res.status(500).json({
      success: false,
      message: "Order update fail"
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { paidAmount, paymentNote } = req.body;

    if (paidAmount === undefined)
      return res.status(400).json({ success: false, message: "paidAmount required" });

    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.paidAmount = Math.min(Number(paidAmount), order.totalPrice);

    if (paymentNote !== undefined)
      order.paymentNote = paymentNote;

    await order.save();

    return res.json({
      success: true,
      data: order
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Payment update fail"
    });
  }
};
