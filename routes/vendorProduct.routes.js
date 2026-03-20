// const express = require("express");
// const router  = express.Router();
// const multer  = require("multer");

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
// });

// const vendorAuth = require("../middleware/vendorAuth");
// const ctrl       = require("../controllers/vendorProduct.controller");

// /* ALL ROUTES PROTECTED */
// router.use(vendorAuth);

// /* ─── GET ─── */
// router.get("/",       ctrl.getMyProducts);
// router.get("/tree",   ctrl.getVendorProductsTree);
// router.get("/export", ctrl.exportProducts);

// /* ─── POST ─── */
// router.post("/",                upload.single("file"), ctrl.createProduct);
// router.post("/import",          upload.single("file"), ctrl.importProducts);
// router.post("/bulk-update",     ctrl.bulkUpdateProducts);
// router.post("/delete-selected", ctrl.deleteSelected);
// router.post("/export-selected", ctrl.exportSelected);
// router.post("/copy/:id",        ctrl.copyProduct);

// /* ─── PUT ─── */
// router.put("/status/:id", ctrl.updateStatus);
// router.put("/:id",        upload.single("file"), ctrl.updateProduct);

// /* ─── DELETE ─── */
// router.delete("/:id", ctrl.deleteProduct);

// module.exports = router;



const express = require("express");
const router  = express.Router();
const multer  = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

const vendorAuth = require("../middleware/vendorAuth");
const ctrl       = require("../controllers/vendorProduct.controller");

/* ALL ROUTES PROTECTED */
router.use(vendorAuth);

/* ──────────────────────────────────────────────────────
   HSN CODE ROUTES  (must be before /:id to avoid conflict)
────────────────────────────────────────────────────── */
router.get("/hsn-codes",       ctrl.getHsnCodes);   // GET /api/vendor/products/hsn-codes?search=milk&category=Dairy
router.get("/hsn-codes/:code", ctrl.getHsnByCode);  // GET /api/vendor/products/hsn-codes/0401

/* ──────────────────────────────────────────────────────
   GET
────────────────────────────────────────────────────── */
router.get("/",       ctrl.getMyProducts);
router.get("/tree",   ctrl.getVendorProductsTree);
router.get("/export", ctrl.exportProducts);

/* ──────────────────────────────────────────────────────
   POST
────────────────────────────────────────────────────── */
router.post("/",                upload.array("files", 4), ctrl.createProduct);
router.post("/import",          upload.single("file"),    ctrl.importProducts);
router.post("/bulk-update",                               ctrl.bulkUpdateProducts);
router.post("/delete-selected",                           ctrl.deleteSelected);
router.post("/export-selected",                           ctrl.exportSelected);
router.post("/copy/:id",                                  ctrl.copyProduct);

/* ──────────────────────────────────────────────────────
   PUT
────────────────────────────────────────────────────── */
router.put("/status/:id", ctrl.updateStatus);
router.put("/:id",        upload.array("files", 4), ctrl.updateProduct);

/* ──────────────────────────────────────────────────────
   DELETE
────────────────────────────────────────────────────── */
router.delete("/:id", ctrl.deleteProduct);

module.exports = router;