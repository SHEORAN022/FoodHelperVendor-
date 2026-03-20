// // const express = require("express");
// // const router = express.Router();
// // const multer = require("multer");

// // const upload = multer({ storage: multer.memoryStorage() });
// // const priceController = require("../controllers/priceController");

// // // WEBSITE ACTIVE PRICES
// // router.get("/website", priceController.getWebsitePrices);

// // // STATUS CHANGE
// // router.put("/status/:id", priceController.updateStatus);

// // // BULK UPDATE
// // router.post("/bulk-update", priceController.bulkUpdatePrices);

// // // COPY PRICE
// // router.post("/copy/:id", priceController.copyPrice);

// // // QUICK PROFIT/LOSS UPDATE
// // router.put("/updateDiff/:id", priceController.updateDiff);

// // // GET ALL PRICES
// // router.get("/", priceController.getPrices);

// // // CREATE PRICE
// // router.post("/", upload.single("file"), priceController.createPrice);

// // // IMPORT CSV
// // router.post("/import", upload.single("file"), priceController.importPrices);

// // // EXPORT ALL CSV
// // router.get("/export", priceController.exportPrices);

// // // EXPORT SELECTED CSV
// // router.post("/export-selected", priceController.exportSelected);

// // // DELETE SELECTED
// // router.post("/delete-selected", priceController.deleteSelected);

// // // UPDATE PRICE
// // router.put("/:id", upload.single("file"), priceController.updatePrice);

// // // DELETE PRICE
// // router.delete("/:id", priceController.deletePrice);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");

// const upload = multer({ storage: multer.memoryStorage() });
// const priceController = require("../controllers/priceController");

// // WEBSITE ACTIVE PRICES
// router.get("/website", priceController.getWebsitePrices);

// // STATUS CHANGE
// router.put("/status/:id", priceController.updateStatus);

// // BULK UPDATE
// router.post("/bulk-update", priceController.bulkUpdatePrices);

// // COPY PRICE
// router.post("/copy/:id", priceController.copyPrice);

// // QUICK PROFIT/LOSS UPDATE
// router.put("/updateDiff/:id", priceController.updateDiff);

// // GET ALL PRICES
// router.get("/", priceController.getPrices);

// // CREATE PRICE
// router.post("/", upload.single("file"), priceController.createPrice);

// // IMPORT CSV
// router.post("/import", upload.single("file"), priceController.importPrices);

// // EXPORT ALL CSV
// router.get("/export", priceController.exportPrices);

// // EXPORT SELECTED CSV
// router.post("/export-selected", priceController.exportSelected);

// // DELETE SELECTED
// router.post("/delete-selected", priceController.deleteSelected);

// // UPDATE PRICE
// router.put("/:id", upload.single("file"), priceController.updatePrice);

// // DELETE PRICE
// router.delete("/:id", priceController.deletePrice);

// module.exports = router;

const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const priceController = require("../controllers/priceController");

// WEBSITE ACTIVE PRICES
router.get("/website", priceController.getWebsitePrices);

// STATUS CHANGE
router.put("/status/:id", priceController.updateStatus);

// BULK UPDATE
router.post("/bulk-update", priceController.bulkUpdatePrices);

// COPY PRICE
router.post("/copy/:id", priceController.copyPrice);

// QUICK PROFIT/LOSS UPDATE
router.put("/updateDiff/:id", priceController.updateDiff);

// GET ALL PRICES
router.get("/", priceController.getPrices);

// CREATE PRICE
router.post("/", upload.single("file"), priceController.createPrice);

// IMPORT CSV
router.post("/import", upload.single("file"), priceController.importPrices);

// EXPORT ALL CSV
router.get("/export", priceController.exportPrices);

// EXPORT SELECTED CSV
router.post("/export-selected", priceController.exportSelected);

// DELETE SELECTED
router.post("/delete-selected", priceController.deleteSelected);

// UPDATE PRICE
router.put("/:id", upload.single("file"), priceController.updatePrice);

// DELETE PRICE
router.delete("/:id", priceController.deletePrice);

router.post("/prices/set-gst", priceController.setGST);
router.get("/prices/gst-list", priceController.getGSTList);

router.post("/prices/add-discount", priceController.addDiscount);
router.get("/prices/discount-list", priceController.getDiscountList);


module.exports = router;
