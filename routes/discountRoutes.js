const router = require("express").Router();
const {
  addDiscount,
  getAllDiscounts,
  updateDiscount,
  deleteDiscount,
} = require("../controllers/discountController");

/* CREATE */
router.post("/add", addDiscount);

/* READ */
router.get("/all", getAllDiscounts);

/* UPDATE */
router.put("/:id", updateDiscount);

/* DELETE */
router.delete("/:id", deleteDiscount);

module.exports = router;
