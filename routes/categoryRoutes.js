
const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/categoryController");

// Create category with image
router.post("/", upload.single("image"), createCategory);

// Get all categories
router.get("/", getCategories);

// Update category (with optional image replace)
router.put("/:id", upload.single("image"), updateCategory);

// Delete category + image
router.delete("/:id", deleteCategory);

/* ---------------- Subcategory routes (inside category) -------------- */

// Add subcategory to a category
// POST /api/categories/:id/sub  (form-data: name, image)
router.post("/:id/sub", upload.single("image"), addSubcategory);

// Update subcategory
// PUT /api/categories/:id/sub/:subId  (form-data: name, active, image(optional))
router.put("/:id/sub/:subId", upload.single("image"), updateSubcategory);

// Delete subcategory
router.delete("/:id/sub/:subId", deleteSubcategory);

module.exports = router;

