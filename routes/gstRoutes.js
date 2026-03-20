// const router = require("express").Router();
// const GstRate = require("../models/GstRate");
// const { setGST } = require("../controllers/gstController");

// router.post("/set", setGST);

// /* ⭐ GET ALL GST (Admin panel ke liye) */
// router.get("/all", async (req, res) => {
//   const data = await GstRate.find().populate("product", "name");
//   res.json(data);
// });

// module.exports = router;

const router = require("express").Router();
const {
  setGST,
  getAllGST,
  getGSTById,
  getGSTByProduct,
  updateGST,
  deleteGST,
} = require("../controllers/gstController");

/* CREATE/UPDATE GST RULE */
router.post("/set", setGST);

/* READ ALL GST RULES */
router.get("/all", getAllGST);

/* READ SINGLE GST RULE BY ID */
router.get("/:id", getGSTById);

/* READ GST RULE BY PRODUCT ID */
router.get("/product/:productId", getGSTByProduct);

/* UPDATE GST RULE */
router.put("/:id", updateGST);

/* DELETE GST RULE */
router.delete("/:id", deleteGST);

module.exports = router;