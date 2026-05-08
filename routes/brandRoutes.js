const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  createBrand,
  getBrands,
} = require("../controllers/brandController");


// CREATE BRAND
router.post(
  "/",
  upload.single("image"),
  createBrand
);


// GET ALL BRANDS
router.get("/", getBrands);


module.exports = router;