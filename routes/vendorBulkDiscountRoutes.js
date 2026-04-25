const router = require("express").Router();
const vendorAuth = require("../middleware/vendorAuth");

const {
  createDiscount,
  getMyDiscounts,
  getDiscountsByProduct,
  updateDiscount,
  deleteDiscount,
} = require("../controllers/vendorBulkDiscountController");

router.post("/add",                  vendorAuth, createDiscount);
router.get("/my",                    vendorAuth, getMyDiscounts);
router.get("/product/:productId",    vendorAuth, getDiscountsByProduct);
router.put("/:id",                   vendorAuth, updateDiscount);
router.delete("/:id",                vendorAuth, deleteDiscount);

module.exports = router;