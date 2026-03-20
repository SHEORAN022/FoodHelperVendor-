// const router = require("express").Router();
// const vendorAuth = require("../middleware/vendorAuth");

// const {
//   createDiscount,
//   getMyDiscounts,
//   updateDiscount,
//   deleteDiscount,
// } = require("../controllers/vendorBulkDiscountController");

// /* 🔐 VENDOR BULK DISCOUNT ROUTES */
// router.post("/add", vendorAuth, createDiscount);
// router.get("/my", vendorAuth, getMyDiscounts);
// router.put("/:id", vendorAuth, updateDiscount);
// router.delete("/:id", vendorAuth, deleteDiscount);

// module.exports = router;
const router = require("express").Router();
const vendorAuth = require("../middleware/vendorAuth");

const {
  createDiscount,
  getMyDiscounts,
  updateDiscount,
  deleteDiscount,
} = require("../controllers/vendorBulkDiscountController");

router.post("/add",   vendorAuth, createDiscount);
router.get("/my",     vendorAuth, getMyDiscounts);
router.put("/:id",    vendorAuth, updateDiscount);
router.delete("/:id", vendorAuth, deleteDiscount);

module.exports = router;