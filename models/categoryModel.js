

// const mongoose = require("mongoose");

// const SubcategorySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     image: {
//       type: String, // cloudinary URL
//       default: null,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// const CategorySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     image: {
//       type: String, // cloudinary URL
//       default: null,
//     },
//     subcategories: [SubcategorySchema],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Category", CategorySchema);


const mongoose = require("mongoose");

// Level 3 - Sub-Subcategory (products live here - required selection)
const SubSubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Level 2 - Subcategory
const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    active: { type: Boolean, default: true },
    subSubcategories: [SubSubcategorySchema],
  },
  { timestamps: true }
);

// Level 1 - Category
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    subcategories: [SubcategorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);


