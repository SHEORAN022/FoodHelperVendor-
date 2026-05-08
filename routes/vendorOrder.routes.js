// const express = require("express");
// const router = express.Router();
// const vendorAuth = require("../middleware/vendorAuth");
// const controller = require("../controllers/vendorOrder.controller");

// router.use(vendorAuth);
// router.get("/", controller.getVendorOrders);
// router.put("/:id/status", controller.updateOrderStatus);

// module.exports = router;

const express    = require("express");
const router     = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const ctrl       = require("../controllers/vendorOrder.controller");


router.use(vendorAuth);

// ── Orders ──────────────────────────────────
router.get("/",           ctrl.getVendorOrders);      // GET  all vendor orders
router.get("/:id",        ctrl.getVendorOrderById);   // GET  single order

// ── Status update ────────────────────────────
router.put("/:id/status", ctrl.updateOrderStatus);    // PUT  update order status

// ── Payment update ───────────────────────────
router.put("/:id/payment", ctrl.updatePayment);       // PUT  update payment

// ── Item edit ───────────────────────────────
router.put("/:id/items",  ctrl.updateOrderItems);     // PUT  edit item quantities

module.exports = router;