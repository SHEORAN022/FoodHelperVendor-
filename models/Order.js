const mongoose = require("mongoose");

/* ================= ORDER ITEM ================= */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // 🔥 किस model से आया है
    productModel: {
      type: String,
      enum: ["Price", "VendorProduct"],
      required: true,
    },

    // 🔥 admin ya vendor
    ownerType: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },

    // 🔥 vendor product हो तो vendor id
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    name:      { type: String, required: true },
    image:     { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true },
  },
  { _id: false }
);

/* ================= ORDER ================= */
const OrderSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order mein kam se kam ek item hona chahiye",
      },
    },

    totalPrice: { type: Number, required: true },

    address: {
      name:    { type: String },
      phone:   { type: String },
      street:  { type: String },
      city:    { type: String },
      state:   { type: String },
      pincode: { type: String },
    },

    status: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },

    paymentMode: {
      type: String,
      enum: ["cash", "online", "cod"],
      default: "cash",
    },

    /* ================= PAYMENT ================= */

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    paymentNote: {
      type: String,
      default: "",
    },

    /* ================= RIDER ================= */

    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ================= VIRTUAL ================= */
OrderSchema.virtual("pendingAmount").get(function () {
  return Math.max(0, (this.totalPrice || 0) - (this.paidAmount || 0));
});

/* ================= PRE SAVE ================= */
OrderSchema.pre("save", function (next) {
  const paid  = this.paidAmount || 0;
  const total = this.totalPrice || 0;

  if (paid <= 0) this.paymentStatus = "unpaid";
  else if (paid >= total) this.paymentStatus = "paid";
  else this.paymentStatus = "partial";

  next();
});

module.exports = mongoose.model("Order", OrderSchema);