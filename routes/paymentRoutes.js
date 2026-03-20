const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createPaymentOrder,
  verifyPayment,
  getAllPayments,
} = require("../controllers/paymentController");

router.post("/create", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.get("/admin", protect, adminOnly, getAllPayments);

module.exports = router;
