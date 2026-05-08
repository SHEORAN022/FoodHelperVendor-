
const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const vendorAuth = require("../middleware/vendorAuth");

const {
  // L1 - Category
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  // L2 - SubCategory
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  // L3 - SubSubCategory
  addSubSubCategory,
  updateSubSubCategory,
  deleteSubSubCategory,
  // L4 - Products
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} = require("../controllers/vendorCategoryController");

router.use(vendorAuth);

/* ---- L1: CATEGORY ---- */
router.post("/", upload.single("image"), createCategory);
router.get("/", getCategories);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

/* ---- L2: SUBCATEGORY ---- */
router.post("/:catId/sub", upload.single("image"), addSubCategory);
router.put("/:catId/sub/:subId", upload.single("image"), updateSubCategory);
router.delete("/:catId/sub/:subId", deleteSubCategory);

/* ---- L3: SUB-SUBCATEGORY ---- */
router.post("/:catId/sub/:subId/subsub", upload.single("image"), addSubSubCategory);
router.put("/:catId/sub/:subId/subsub/:subsubId", upload.single("image"), updateSubSubCategory);
router.delete("/:catId/sub/:subId/subsub/:subsubId", deleteSubSubCategory);

/* ---- L4: PRODUCTS ---- */
router.get("/:catId/sub/:subId/subsub/:subsubId/products", getProducts);
router.post("/:catId/sub/:subId/subsub/:subsubId/products", upload.single("image"), addProduct);
router.put("/:catId/sub/:subId/subsub/:subsubId/products/:productId", upload.single("image"), updateProduct);
router.delete("/:catId/sub/:subId/subsub/:subsubId/products/:productId", deleteProduct);

module.exports = router;
