

const mongoose = require("mongoose");

/* ================= PRODUCT SCHEMA (Level 4) ================= */
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null },
    image: { type: String, default: null },
    stock: { type: Number, default: 0 },
    unit: {
      type: String,
      enum: ["piece", "kg", "g", "liter", "ml", "dozen", "pack", "box"],
      default: "piece",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ================= SUB-SUBCATEGORY SCHEMA (Level 3) ================= */
const SubSubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    active: { type: Boolean, default: true },
    products: { type: [ProductSchema], default: [] },
  },
  { timestamps: true }
);

/* ================= SUBCATEGORY SCHEMA (Level 2) ================= */
const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    active: { type: Boolean, default: true },
    subSubCategories: { type: [SubSubCategorySchema], default: [] },
  },
  { timestamps: true }
);

/* ================= CATEGORY SCHEMA (Level 1) ================= */
const VendorCategorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    subcategories: { type: [SubCategorySchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorCategory", VendorCategorySchema);
