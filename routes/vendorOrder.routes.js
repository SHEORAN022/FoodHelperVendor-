
const express    = require("express");
const router     = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const ctrl       = require("../controllers/vendorOrder.controller");


router.use(vendorAuth);

// ── Orders ──────────────────────────────────
router.get("/",           ctrl.getVendorOrders);    
router.get("/:id",        ctrl.getVendorOrderById);  

// ── Status update ────────────────────────────
router.put("/:id/status", ctrl.updateOrderStatus);   

// ── Payment update ───────────────────────────
router.put("/:id/payment", ctrl.updatePayment);      

// ── Item edit ───────────────────────────────
router.put("/:id/items",  ctrl.updateOrderItems);     

module.exports = router;