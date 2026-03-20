// const mongoose = require("mongoose");

// const vendorBulkDiscountSchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//     },

//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VendorProduct", // ✅ FIXED
//       required: true,
//     },

//     minQty: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     maxQty: {
//       type: Number,
//       default: null,
//     },

//     unitPrice: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// /* 🔐 UNIQUE RULE */
// vendorBulkDiscountSchema.index(
//   { vendor: 1, product: 1, minQty: 1, maxQty: 1 },
//   { unique: true }
// );

// module.exports = mongoose.model(
//   "VendorBulkDiscount",
//   vendorBulkDiscountSchema
// );

const mongoose = require("mongoose");

const vendorBulkDiscountSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorProduct", // ✅ apne actual Product model name se match karo
      required: true,
    },
    minQty: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQty: {
      type: Number,
      default: null,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

vendorBulkDiscountSchema.index(
  { vendor: 1, product: 1, minQty: 1, maxQty: 1 },
  { unique: true }
);

module.exports = mongoose.model("VendorBulkDiscount", vendorBulkDiscountSchema);