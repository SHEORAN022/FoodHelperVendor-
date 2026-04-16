
// const mongoose = require("mongoose");

// const weightSchema = new mongoose.Schema({
//   value: { type: Number, default: 1 },
//   unit:  { type: String, enum: ["kg", "gm", "ltr", "ml", "pcs"], default: "kg" },
// });

// const discountSchema = new mongoose.Schema({
//   minQty:          { type: Number, required: true },
//   maxQty:          { type: Number, required: true },
//   discountPercent: { type: Number, required: true },
// });

// const vendorProductSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },

//     name:  { type: String, required: true, trim: true },
//     brand: { type: String, default: "" },

//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VendorCategory",
//       required: true,
//     },

//     subcategory: {
//       id:    { type: String, default: null },
//       name:  { type: String, default: null },
//       image: { type: String, default: null },
//     },

//     subSubCategory: {
//       id:    { type: String, default: null },
//       name:  { type: String, default: null },
//       image: { type: String, default: null },
//     },

//     weight:      weightSchema,
//     description: { type: String, default: "" },

   
//     image: { type: String, default: "" },

    
//     galleryImages: {
//       type: [String],
//       default: [],
//       validate: {
//         validator: (arr) => arr.length <= 4,
//         message: "Gallery can have at most 4 images.",
//       },
//     },

//     basePrice:  { type: Number, required: true },
//     salePrice:  { type: Number, required: true },
//     discount:   { type: Number, default: 0 },

//     gstPercent: { type: Number, default: 0 },
//     hsnCode:    { type: String, default: "" },
//     taxType: {
//       type:    String,
//       enum:    ["cgst_sgst", "igst"],
//       default: "cgst_sgst",
//     },

//     discounts: [discountSchema],
//     validTill: { type: Date },

//     status: {
//       type:    String,
//       enum:    ["active", "inactive"],
//       default: "inactive",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("VendorProduct", vendorProductSchema);



const mongoose = require("mongoose");

const weightSchema = new mongoose.Schema({
  value: { type: Number, default: 1 },
  unit: {
    type: String,
    enum: ["kg", "gm", "ltr", "ml", "pcs"],
    default: "kg",
  },
});

const vendorProductSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "" },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorCategory",
      required: true,
    },

    subcategory: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      image: { type: String, default: null },
    },

    subSubCategory: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      image: { type: String, default: null },
    },

    weight: weightSchema,
    description: { type: String, default: "" },

    image: { type: String, default: "" },

    galleryImages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: "Gallery can have at most 4 images.",
      },
    },

    basePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },

    // ✅ profit field — yahi missing tha
    profit: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },

    gstPercent: { type: Number, default: 0 },
    hsnCode: { type: String, default: "" },
    taxType: {
      type: String,
      enum: ["cgst_sgst", "igst"],
      default: "cgst_sgst",
    },

    validTill: { type: Date },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.VendorProduct ||
  mongoose.model("VendorProduct", vendorProductSchema);