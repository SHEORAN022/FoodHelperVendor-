const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  assignRider,
  updateOrderItems,
  updatePayment,       // ← NEW
} = require("../controllers/orderController");

// ── User routes ──────────────────────────────────────
router.post("/",    protect,             createOrder);
router.get("/my",   protect,             getMyOrders);

// ── Admin routes ─────────────────────────────────────
router.get("/",                  protect, adminOnly, getAllOrders);
router.put("/:id/status",        protect, adminOnly, updateOrderStatus);
router.put("/:id/assign-rider",  protect, adminOnly, assignRider);
router.put("/:id/items",         protect, adminOnly, updateOrderItems);
router.put("/:id/payment",       protect, adminOnly, updatePayment);   // ← NEW

module.exports = router;