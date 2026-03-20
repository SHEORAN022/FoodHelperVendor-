// const mongoose = require("mongoose");

// /* ================= WEIGHT ================= */
// const weightSchema = new mongoose.Schema({
//   value: { type: Number, default: 1 },
//   unit: {
//     type: String,
//     enum: ["kg", "gm", "ltr", "ml", "pcs"],
//     default: "kg",
//   },
// });

// /* ================= VENDOR PRODUCT ================= */
// const vendorProductSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VendorCategory",
//       required: true,
//     },

//     /* Level 2 — Subcategory */
//     subcategory: {
//       id:    { type: String, default: null },
//       name:  { type: String, default: null },
//       image: { type: String, default: null },
//     },

//     /* Level 3 — Sub-Subcategory */
//     subSubCategory: {
//       id:    { type: String, default: null },
//       name:  { type: String, default: null },
//       image: { type: String, default: null },
//     },

//     weight: weightSchema,

//     image:       { type: String, default: "" },
//     description: { type: String, default: "" },

//     basePrice: { type: Number, required: true },
//     salePrice: { type: Number, required: true },
//     discount:  { type: Number, default: 0 },

//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "inactive",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("VendorProduct", vendorProductSchema);

const mongoose = require("mongoose");

/* ================= WEIGHT ================= */
const weightSchema = new mongoose.Schema({
  value: { type: Number, default: 1 },
  unit: {
    type: String,
    enum: ["kg", "gm", "ltr", "ml", "pcs"],
    default: "kg",
  },
});

/* ================= DISCOUNT ================= */
const discountSchema = new mongoose.Schema({
  minQty:          { type: Number, required: true },
  maxQty:          { type: Number, required: true },
  discountPercent: { type: Number, required: true },
});

/* ================= VENDOR PRODUCT ================= */
const vendorProductSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    name:  { type: String, required: true, trim: true },
    brand: { type: String, default: "" },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorCategory",
      required: true,
    },

    /* Level 2 — Subcategory */
    subcategory: {
      id:    { type: String, default: null },
      name:  { type: String, default: null },
      image: { type: String, default: null },
    },

    /* Level 3 — Sub-Subcategory */
    subSubCategory: {
      id:    { type: String, default: null },
      name:  { type: String, default: null },
      image: { type: String, default: null },
    },

    weight: weightSchema,

    description: { type: String, default: "" },

    /* ── Multi-image (up to 4) ── */
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: "A product can have at most 4 images.",
      },
    },
    /* Legacy single-image field — kept for backward compat */
    image: { type: String, default: "" },

    basePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discount:  { type: Number, default: 0 },

    /* ── GST / HSN ── */
    gstPercent: { type: Number, default: 0 },
    hsnCode:    { type: String, default: "" },
    taxType: {
      type: String,
      enum: ["cgst_sgst", "igst"],
      default: "cgst_sgst",
    },

    /* ── Quantity Discounts ── */
    discounts: [discountSchema],

    validTill: { type: Date },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorProduct", vendorProductSchema);