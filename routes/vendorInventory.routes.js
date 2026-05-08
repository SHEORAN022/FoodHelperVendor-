const express    = require("express");
const router     = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const ctrl       = require("../controllers/vendorInventory.controller");

// all routes require vendor auth
router.use(vendorAuth);

// ── Reports (MUST be before /:id to avoid param conflict) ──
router.get("/expiring", ctrl.getExpiring);   // GET  /expiring?days=30
router.get("/low",      ctrl.getLowStock);   // GET  /low

// ── Batch ──────────────────────────────────────────────────
router.post("/batch", ctrl.batchUpsertInventory); // POST /batch

// ── CRUD ───────────────────────────────────────────────────
router.get("/",    ctrl.getInventory);        // GET    all  ?search=&status=
router.post("/",   ctrl.createInventory);     // POST   create
router.get("/:id", ctrl.getInventoryById);    // GET    single
router.put("/:id", ctrl.updateInventory);     // PUT    update stock + expiry
router.delete("/:id", ctrl.deleteInventory);  // DELETE

// ── Extra ──────────────────────────────────────────────────
router.patch("/:id/restock", ctrl.restockInventory); // PATCH add qty

module.exports = router;