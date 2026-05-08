// const mongoose = require("mongoose");

// const vendorInventorySchema = new mongoose.Schema(
//   {
//     vendor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Vendor",
//       required: true,
//       index: true,
//     },

//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VendorProduct",
//       required: true,
//       index: true,
//     },

//     totalStock: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     availableStock: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     minStock: {
//       type: Number,
//       default: 5,
//       min: 0,
//     },

//     outOfStock: {
//       type: Boolean,
//       default: false,
//     },

//     // ✅ NEW: Expiry date for perishable items
//     expiryDate: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Virtual: days until expiry (negative = already expired)
// vendorInventorySchema.virtual("daysUntilExpiry").get(function () {
//   if (!this.expiryDate) return null;
//   return Math.ceil((new Date(this.expiryDate) - Date.now()) / 86400000);
// });

// vendorInventorySchema.set("toJSON", { virtuals: true });
// vendorInventorySchema.set("toObject", { virtuals: true });

// module.exports = mongoose.model("VendorInventory", vendorInventorySchema);

const mongoose = require("mongoose");

// ── Batch sub-schema ──────────────────────────────────────────────────────────
// Ek product ke multiple batches ho sakte hain (different mfg/expiry dates)
const batchSchema = new mongoose.Schema(
  {
    batchNo:    { type: String, default: "" },       // e.g. "LOT-001"
    mfgDate:    { type: Date,   default: null },      // Manufacturing date
    expiryDate: { type: Date,   default: null },      // Expiry date
    qty:        { type: Number, default: 0, min: 0 }, // Stock in this batch
  },
  { _id: true }
);

// ── Main VendorInventory schema ───────────────────────────────────────────────
const vendorInventorySchema = new mongoose.Schema(
  {
    vendor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Vendor",
      required: true,
      index:    true,
    },

    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "VendorProduct",
      required: true,
      index:    true,
    },

    
    totalStock: {
      type:     Number,
      required: true,
      min:      0,
    },

    availableStock: {
      type:     Number,
      required: true,
      min:      0,
    },

    minStock: {
      type:    Number,
      default: 5,
      min:     0,
    },

    outOfStock: {
      type:    Boolean,
      default: false,
    },

    // ── Expiry (single / legacy) ──────────────────────────────────────────────
    // Agar batches hain → nearest batch expiry se auto-set hoti hai (pre-save)
    expiryDate: {
      type:    Date,
      default: null,
    },

    // ── Batches list ──────────────────────────────────────────────────────────
    batches: {
      type:    [batchSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// ── Pre-save: batch mode mein auto-calculate stock + nearest expiry ──────────
vendorInventorySchema.pre("save", function (next) {
  if (this.batches && this.batches.length > 0) {
    const totalFromBatches = this.batches.reduce(
      (sum, b) => sum + (b.qty || 0),
      0
    );
    this.totalStock     = totalFromBatches;
    this.availableStock = totalFromBatches;

    // Nearest expiry date
    const withExpiry = this.batches.filter((b) => b.expiryDate);
    if (withExpiry.length > 0) {
      withExpiry.sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
      );
      this.expiryDate = withExpiry[0].expiryDate;
    } else {
      this.expiryDate = null;
    }
  }

  this.outOfStock = this.availableStock <= 0;
  next();
});

// ── Virtual: days until nearest expiry ───────────────────────────────────────
vendorInventorySchema.virtual("daysUntilExpiry").get(function () {
  if (!this.expiryDate) return null;
  return Math.ceil((new Date(this.expiryDate) - Date.now()) / 86400000);
});

vendorInventorySchema.set("toJSON",   { virtuals: true });
vendorInventorySchema.set("toObject", { virtuals: true });

// Ensure one inventory record per vendor+product
vendorInventorySchema.index({ vendor: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("VendorInventory", vendorInventorySchema);