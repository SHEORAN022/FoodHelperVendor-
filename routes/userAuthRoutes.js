const express = require("express");
const {
  signup,
  login,
  getAllUsers,
} = require("../controllers/userAuthController");

const adminAuth = require("../middleware/adminAuth");
const vendorAuth = require("../middleware/vendorAuth"); // ✅ ADD

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

/* ADMIN ONLY */
router.get("/admin/all", adminAuth, getAllUsers);

/* VENDOR ONLY */
router.get("/vendor/all", vendorAuth, getAllUsers);

module.exports = router;