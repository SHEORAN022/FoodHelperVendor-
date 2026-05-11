const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/Publicproducts.controller");


router.get("/admin",  ctrl.getAdminPublicProducts);
router.get("/vendor", ctrl.getVendorPublicProducts);
router.get("/tree",   ctrl.getPublicProductsTree);


router.get("/", ctrl.getAllPublicProducts);


router.get("/:id", ctrl.getPublicProductById);

module.exports = router;