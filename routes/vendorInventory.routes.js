// const express = require("express");
// const router = express.Router();
// const vendorAuth = require("../middleware/vendorAuth");
// const controller = require("../controllers/vendorInventory.controller");

// router.use(vendorAuth);

// router.get("/", controller.getInventory);
// router.post("/", controller.upsertInventory);

// module.exports = router;


const express = require("express");
const router = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const ctrl = require("../controllers/vendorInventory.controller");

// Apply vendor auth middleware to all routes
router.use(vendorAuth);

// ── CRUD Routes ──────────────────────────────────────
router.get("/",          ctrl.getInventory);        // GET    all inventory
router.get("/:id",       ctrl.getInventoryById);    // GET    single inventory
router.post("/",         ctrl.createInventory);     // POST   create new
router.put("/:id",       ctrl.updateInventory);     // PUT    full update (set stock)
router.delete("/:id",    ctrl.deleteInventory);     // DELETE remove record

// ── Extra ─────────────────────────────────────────────
router.patch("/:id/restock", ctrl.restockInventory); // PATCH  add qty to existing stock

module.exports = router;