const express = require("express");
const router = express.Router();

// ✅ Apna actual authMiddleware use karo
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllVendorCategories,
  approveCategory,
  rejectCategory,
} = require("../controllers/adminCategoryController");

router.get("/categories", protect, adminOnly, getAllVendorCategories);
router.put("/categories/:id/approve", protect, adminOnly, approveCategory);
router.put("/categories/:id/reject", protect, adminOnly, rejectCategory);

module.exports = router;