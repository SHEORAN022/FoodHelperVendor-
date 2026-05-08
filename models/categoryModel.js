

const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // cloudinary URL
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // cloudinary URL
      default: null,
    },
    subcategories: [SubcategorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);


