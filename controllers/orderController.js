// // const Order = require("../models/Order");
// // const Price = require("../models/priceModel");
// // const User = require("../models/User");

// // // ================= CREATE ORDER =================
// // exports.createOrder = async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const { productId, quantity, address } = req.body;

// //     const user = await User.findById(userId);
// //     if (!user) return res.status(404).json({ success: false, message: "User not found" });

// //     const product = await Price.findById(productId);
// //     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

// //     const order = await Order.create({
// //       user: user._id,
// //       userName: user.name || user.email,
// //       product: product._id,
// //       productName: product.name,
// //       price: product.salePrice,
// //       quantity: quantity || 1,
// //       address,
// //     });

// //     res.json({ success: true, data: order });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // ================= USER ORDERS =================
// // exports.getMyOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find({ user: req.user.id })
// //       .populate("product", "name image salePrice")
// //       .sort({ createdAt: -1 });

// //     res.json({ success: true, data: orders });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // ================= ADMIN ALL ORDERS =================
// // exports.getAllOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find()
// //       .populate("user", "name email")
// //       .populate("product", "name salePrice image")
// //       .sort({ createdAt: -1 });

// //     res.json({ success: true, data: orders });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // // ================= UPDATE STATUS =================
// // exports.updateOrderStatus = async (req, res) => {
// //   try {
// //     const order = await Order.findByIdAndUpdate(
// //       req.params.id,
// //       { status: req.body.status },
// //       { new: true }
// //     );

// //     res.json({ success: true, data: order });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };


// const Order = require("../models/Order");
// const Price = require("../models/priceModel");
// const User = require("../models/User");

// /* ======================================================
//    CREATE ORDER
// ====================================================== */
// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { productId, quantity = 1, address } = req.body;

//     /* 🔎 USER CHECK */
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     /* 🔎 PRODUCT CHECK */
//     const product = await Price.findById(productId);
//     if (!product || product.status !== "active") {
//       return res.status(404).json({
//         success: false,
//         message: "Product not available",
//       });
//     }

//     /* 🔢 QUANTITY VALIDATION */
//     if (!Number.isInteger(quantity) || quantity < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be a number greater than 0",
//       });
//     }

//     /* 💰 PRICE CALCULATION */
//     const unitPrice = product.salePrice;     // product ka current sale price
//     const totalPrice = unitPrice * quantity; // FINAL TOTAL

//     /* 📦 CREATE ORDER */
//     const order = await Order.create({
//       user: user._id,
//       userName: user.name || user.email,
//       product: product._id,
//       productName: product.name,
//       price: totalPrice,     // 🔐 TOTAL PRICE LOCKED
//       quantity,
//       address,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       data: {
//         orderId: order._id,
//         productName: order.productName,
//         unitPrice,
//         quantity,
//         totalPrice,
//         status: order.status,
//         createdAt: order.createdAt,
//       },
//     });

//   } catch (err) {
//     console.error("Create Order Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to place order",
//     });
//   }
// };

// /* ======================================================
//    USER - MY ORDERS
// ====================================================== */
// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user.id })
//       .populate("product", "name image")
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       count: orders.length,
//       data: orders,
//     });
//   } catch (err) {
//     console.error("Get My Orders Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//     });
//   }
// };

// /* ======================================================
//    ADMIN - ALL ORDERS
// ====================================================== */
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("user", "name email")
//       .populate("product", "name image")
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       count: orders.length,
//       data: orders,
//     });
//   } catch (err) {
//     console.error("Get All Orders Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//     });
//   }
// };

// /* ======================================================
//    ADMIN - UPDATE ORDER STATUS
// ====================================================== */
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const allowedStatus = [
//       "placed",
//       "confirmed",
//       "shipped",
//       "delivered",
//       "cancelled",
//     ];

//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order status",
//       });
//     }

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Order status updated",
//       data: order,
//     });
//   } catch (err) {
//     console.error("Update Order Status Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update order status",
//     });
//   }
// };


const Order = require("../models/Order");
const Price = require("../models/priceModel");
const User = require("../models/User");

/* ======================================================
   CREATE ORDER
====================================================== */
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, address } = req.body;

    /* 🔎 USER CHECK */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* 🔎 PRODUCT CHECK */
    const product = await Price.findById(productId);
    if (!product || product.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    /* 🔢 QUANTITY VALIDATION */
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number greater than 0",
      });
    }

    /* 💰 PRICE CALCULATION */
    const unitPrice = product.salePrice;     // product ka order-time price
    const totalPrice = unitPrice * quantity; // FINAL TOTAL

    /* 📦 CREATE ORDER */
    const order = await Order.create({
      user: user._id,
      userName: user.name || user.email,
      product: product._id,
      productName: product.name,
      unitPrice: unitPrice,   // ✅ REQUIRED BY SCHEMA
      quantity,
      price: totalPrice,      // ✅ FINAL TOTAL
      address,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order._id,
        productName: order.productName,
        unitPrice: order.unitPrice,
        quantity: order.quantity,
        price: order.price,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

/* ======================================================
   USER - MY ORDERS
====================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("Get My Orders Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* ======================================================
   ADMIN - ALL ORDERS
====================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* ======================================================
   ADMIN - UPDATE ORDER STATUS
====================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};
