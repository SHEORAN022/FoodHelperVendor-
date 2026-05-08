const router = require("express").Router();
const {
  createInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  batchSetInventory,
  addLedgerEntry,
  getLedger,
  deleteLedgerEntry,
  stockReport,
  lowStock,
  deadStock,
  expiringStock,
} = require("../controllers/inventoryController");


router.get("/",        getInventory);
router.post("/",       createInventory);
router.get("/:id",     getInventoryById);
router.put("/:id",     updateInventory);
router.delete("/:id",  deleteInventory);
router.post("/batch",  batchSetInventory);


router.get("/ledger",         getLedger);
router.post("/ledger",        addLedgerEntry);
router.delete("/ledger/:id",  deleteLedgerEntry);


router.get("/report",   stockReport);
router.get("/low",      lowStock);
router.get("/dead",     deadStock);
router.get("/expiring", expiringStock);

module.exports = router;