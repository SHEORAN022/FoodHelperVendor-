const mongoose = require("mongoose");

const weightSchema = new mongoose.Schema({
  value: { type: Number },
  unit: {
    type: String,
    enum: ["kg", "gm", "ltr", "ml", "pcs"],
    default: "kg",
  },
});


const unitConversionSchema = new mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    nPcs: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false }
);

const vendorProductSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

  category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
  required: true,
},

    subcategory: {
      id:    { type: String, default: null },
      name:  { type: String, default: null },
      image: { type: String, default: null },
    },

    subSubCategory: {
      id:    { type: String, default: null },
      name:  { type: String, default: null },
      image: { type: String, default: null },
    },

    weight: {
      type: weightSchema,
      default: null,
    },

    unitConversions: {
      type: [unitConversionSchema],
      default: [],
    },

    packaging: {
      box:            { type: Number, default: 0 },
      packetPerBox:   { type: Number, default: 0 },
      piecePerPacket: { type: Number, default: 0 },
    },

    description:   { type: String, default: "" },
    image:         { type: String, default: "" },

    galleryImages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 4,
        message:   "Gallery can have at most 4 images.",
      },
    },

    basePrice: { type: Number, required: true },
      mrp: {
        type: Number,
        default: 0,
      },
    salePrice: { type: Number, required: true },
    profit:    { type: Number, default: 0 },
    discount:  { type: Number, default: 0 },

    gstPercent:  { type: Number, default: 0 },
    cessPercent: { type: Number, default: 0 },
    hsnCode:     { type: String, default: "" },
    taxType: {
      type:    String,
      enum:    ["cgst_sgst", "igst"],
      default: "cgst_sgst",
    },

    priceExcludingGst: { type: Number, default: 0 },
    gstAmount:         { type: Number, default: 0 },
    cgstPercent:       { type: Number, default: 0 },
    sgstPercent:       { type: Number, default: 0 },
    igstPercent:       { type: Number, default: 0 },
    cgstAmount:        { type: Number, default: 0 },
    sgstAmount:        { type: Number, default: 0 },
    igstAmount:        { type: Number, default: 0 },
    cessAmount:        { type: Number, default: 0 },
    totalTaxAmount:    { type: Number, default: 0 },

    validTill: { type: Date },

    status: {
      type:    String,
      enum:    ["active", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VendorProduct ||
  mongoose.model("VendorProduct", vendorProductSchema);