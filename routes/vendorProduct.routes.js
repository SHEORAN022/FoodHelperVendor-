

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const vendorAuth = require("../middleware/vendorAuth");
const ctrl       = require("../controllers/vendorProduct.controller");

const storage = multer.memoryStorage();
const limits  = { fileSize: 5 * 1024 * 1024 };

const uploadBoth = multer({ storage, limits }).fields([
  { name: "mainImage",     maxCount: 1 },
  { name: "galleryImages", maxCount: 4 },
]);
const uploadCSV = multer({ storage, limits }).single("file");

router.use(vendorAuth);

/* ── HSN (DB-driven) ── */
router.get("/hsn-codes",       ctrl.getHsnCodes);
router.get("/hsn-codes/:code", ctrl.getHsnByCode);
router.post("/hsn-codes",      ctrl.createHsnCode);

/* ── GET ── */
router.get("/",       ctrl.getMyProducts);
router.get("/tree",   ctrl.getVendorProductsTree);
router.get("/export", ctrl.exportProducts);

/* ── POST ── */
router.post("/",                uploadBoth, ctrl.createProduct);
router.post("/import",          uploadCSV,  ctrl.importProducts);
router.post("/bulk-update",                 ctrl.bulkUpdateProducts);
router.post("/delete-selected",             ctrl.deleteSelected);
router.post("/export-selected",             ctrl.exportSelected);
router.post("/copy/:id",                    ctrl.copyProduct);
router.post("/fix-prices",                  ctrl.fixAllProductPrices);   // ✅ one-time migration

/* ── PUT ── */
router.put("/status/:id", ctrl.updateStatus);
router.put("/:id",        uploadBoth, ctrl.updateProduct);

/* ── DELETE ── */
router.delete("/:id", ctrl.deleteProduct);

module.exports = router;