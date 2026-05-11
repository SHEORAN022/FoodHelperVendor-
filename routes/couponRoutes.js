const express = require("express");
const router = express.Router();
const controller = require("../controllers/couponController");

/* ADMIN */
router.post("/admin", controller.createCoupon);
router.get("/admin", controller.getAllCoupons);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);
router.put("/toggle/:id", controller.toggleCoupon);

/* USER */
router.get("/", controller.getCoupons);
router.post("/apply", controller.applyCoupon);

module.exports = router;