const express = require("express");
const router = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const controller = require("../controllers/vendorOrder.controller");

/* 🔥 TEST / USER SIDE – CREATE ORDER */
router.post("/", controller.createOrder);

/* 🔥 VENDOR SIDE (PROTECTED) */
router.use(vendorAuth);
router.get("/", controller.getVendorOrders);
router.put("/:id/status", controller.updateOrderStatus);

module.exports = router;
