// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type:     mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//     productModel: {
//       type:     String,
//       enum:     ["Price", "VendorProduct"],
//       required: true,
//     },
//     ownerType: {
//       type:     String,
//       enum:     ["admin", "vendor"],
//       required: true,
//     },
//     vendorId: {
//       type:    mongoose.Schema.Types.ObjectId,
//       ref:     "Vendor",
//       default: null,
//     },
//     name:      { type: String, required: true },
//     image:     { type: String, default: "" },
//     unitPrice: { type: Number, required: true },
//     quantity:  { type: Number, required: true, min: 1 },
//     price:     { type: Number, required: true },
//     mrp:       { type: Number, default: 0 },
//     hsn:       { type: String, default: "" },
//     gstRate:   { type: Number, default: 0 },
//     cess:      { type: Number, default: 0 },
//     unit:      { type: String, default: "pcs" },
//     packing:   { type: String, default: "" },
//     packagingText: { type: String, default: "" },

//     unitDefs: {
//       type: [
//         {
//           key:        { type: String },
//           label:      { type: String },
//           multiplier: { type: Number, default: 1 },
//           isDefault:  { type: Boolean, default: false },
//           order:      { type: Number, default: 0 },
//         },
//       ],
//       default: [],
//     },
//   },
//   { _id: false }
// );

// const OrderSchema = new mongoose.Schema(
//   {
//     user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     userName: { type: String, required: true },

//     items: {
//       type: [orderItemSchema],
//       required: true,
//       validate: {
//         validator: (arr) => arr.length > 0,
//         message:   "Order mein kam se kam ek item hona chahiye",
//       },
//     },

//     originalItems:      { type: [orderItemSchema], default: undefined },
//     originalTotalPrice: { type: Number,            default: undefined },

//     totalPrice: { type: Number, required: true },

//     // ── Coupon ──────────────────────────────────────────────────
//     couponCode:     { type: String, default: null },
//     couponDiscount: { type: Number, default: 0    },
//     finalPrice:     { type: Number, default: null },

//     address: {
//       name:    { type: String, default: "" },
//       phone:   { type: String, default: "" },
//       street:  { type: String, default: "" },
//       city:    { type: String, default: "" },
//       state:   { type: String, default: "" },
//       pincode: { type: String, default: "" },
//     },

//     status: {
//       type:    String,
//       enum:    ["placed", "confirmed", "shipped", "delivered","accepted", "cancelled"],
//       default: "placed",
//     },

//     paymentMode: {
//       type:    String,
//       enum:    ["cash", "online", "cod"],
//       default: "cash",
//     },

//     paidAmount:    { type: Number, default: 0,        min: 0 },
//     paymentStatus: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
//     paymentNote:   { type: String, default: "" },

//     assignedRider: {
//       type:    mongoose.Schema.Types.ObjectId,
//       ref:     "Rider",
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON:     { virtuals: true },
//     toObject:   { virtuals: true },
//   }
// );

// // ─── VIRTUAL: pendingAmount ───────────────────────────────────────────────────
// OrderSchema.virtual("pendingAmount").get(function () {
//   const effective = this.finalPrice ?? this.totalPrice ?? 0;
//   return +(Math.max(0, effective - (this.paidAmount || 0))).toFixed(2);
// });

// // ─── VIRTUAL: gstSummary ─────────────────────────────────────────────────────
// OrderSchema.virtual("gstSummary").get(function () {
//   const items = this.items || [];

//   let totalTaxableValue = 0;
//   let totalCgst         = 0;
//   let totalSgst         = 0;
//   let totalCess         = 0;
//   let totalGst          = 0;

//   const itemBreakdown = items.map((item) => {
//     const gstRate  = item.gstRate || 0;
//     const cessRate = item.cess    || 0;

//     const divisor      = 1 + gstRate / 100 + cessRate / 100;
//     const taxableValue = +(item.price / divisor).toFixed(2);
//     const cessAmount   = +((taxableValue * cessRate) / 100).toFixed(2);
//     const cgst         = +((taxableValue * (gstRate / 2)) / 100).toFixed(2);
//     const sgst         = cgst;
//     const gstAmount    = +((cgst + sgst + cessAmount)).toFixed(2);

//     totalTaxableValue += taxableValue;
//     totalCgst         += cgst;
//     totalSgst         += sgst;
//     totalCess         += cessAmount;
//     totalGst          += gstAmount;

//     return {
//       name:         item.name,
//       hsn:          item.hsn      || "",
//       quantity:     item.quantity,
//       unit:         item.unit     || "pcs",
//       mrp:          item.mrp      || item.unitPrice,
//       unitPrice:    item.unitPrice,
//       gstRate:      `${gstRate}%`,
//       cessRate:     `${cessRate}%`,
//       taxableValue: +taxableValue.toFixed(2),
//       cgst:         +cgst.toFixed(2),
//       sgst:         +sgst.toFixed(2),
//       cess:         +cessAmount.toFixed(2),
//       totalGst:     +gstAmount.toFixed(2),
//       lineTotal:    item.price,
//     };
//   });

//   return {
//     itemBreakdown,
//     totals: {
//       taxableValue: +totalTaxableValue.toFixed(2),
//       cgst:         +totalCgst.toFixed(2),
//       sgst:         +totalSgst.toFixed(2),
//       cess:         +totalCess.toFixed(2),
//       totalGst:     +totalGst.toFixed(2),
//     },
//   };
// });

// // ─── PRE-SAVE HOOK: paymentStatus auto-set ───────────────────────────────────
// OrderSchema.pre("save", function (next) {
//   const paid      = this.paidAmount || 0;
//   const effective = this.finalPrice ?? this.totalPrice ?? 0;

//   if (paid <= 0)              this.paymentStatus = "unpaid";
//   else if (paid >= effective) this.paymentStatus = "paid";
//   else                        this.paymentStatus = "partial";

//   next();
// });

// module.exports = mongoose.model("Order", OrderSchema);

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    productModel: {
      type: String,
      enum: ["Price", "VendorProduct"],
      required: true,
    },

    ownerType: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    name: { type: String, required: true },

    image: {
      type: String,
      default: "",
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    hsn: {
      type: String,
      default: "",
    },

    gstRate: {
      type: Number,
      default: 0,
    },

    cess: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    packing: {
      type: String,
      default: "",
    },

    packagingText: {
      type: String,
      default: "",
    },

    unitDefs: {
      type: [
        {
          key: { type: String },

          label: { type: String },

          multiplier: {
            type: Number,
            default: 1,
          },

          isDefault: {
            type: Boolean,
            default: false,
          },

          order: {
            type: Number,
            default: 0,
          },
        },
      ],

      default: [],
    },
  },

  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],

      required: true,

      validate: {
        validator: (arr) => arr.length > 0,

        message:
          "Order mein kam se kam ek item hona chahiye",
      },
    },

    originalItems: {
      type: [orderItemSchema],
      default: undefined,
    },

    originalTotalPrice: {
      type: Number,
      default: undefined,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // ── Coupon ─────────────────────────────────────
    couponCode: {
      type: String,
      default: null,
    },

    couponDiscount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      default: null,
    },

    address: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      street: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    // ── STATUS ─────────────────────────────────────
    status: {
      type: String,

      enum: [
        // OLD SUPPORT
        "placed",
        "confirmed",

        // NEW
        "pending",
        "accepted",
        "shipped",
        "delivered",
        "cancelled",
        "canceled",
      ],

      default: "pending",

      set: (value) => {
        if (!value) return "pending";

        const v = String(value)
          .toLowerCase()
          .trim();

        // OLD → NEW
        if (v === "placed") {
          return "pending";
        }

        if (v === "confirmed") {
          return "accepted";
        }

        if (v === "canceled") {
          return "cancelled";
        }

        return v;
      },

      get: (value) => {
        if (!value) return "pending";

        const v = String(value)
          .toLowerCase()
          .trim();

        // DB OLD VALUES → NEW VALUES
        if (v === "placed") {
          return "pending";
        }

        if (v === "confirmed") {
          return "accepted";
        }

        if (v === "canceled") {
          return "cancelled";
        }

        return v;
      },
    },

    // ── PAYMENT ─────────────────────────────────────
    paymentMode: {
      type: String,

      enum: ["cash", "online", "cod"],

      default: "cash",
    },

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

    assignedRider: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Rider",

      default: null,
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      getters: true,
    },

    toObject: {
      virtuals: true,
      getters: true,
    },
  }
);

// ─── VIRTUAL: pendingAmount ─────────────────────
OrderSchema.virtual("pendingAmount").get(function () {
  const effective =
    this.finalPrice ?? this.totalPrice ?? 0;

  return +(
    Math.max(
      0,
      effective - (this.paidAmount || 0)
    )
  ).toFixed(2);
});

// ─── VIRTUAL: gstSummary ─────────────────────
OrderSchema.virtual("gstSummary").get(function () {
  const items = this.items || [];

  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalCess = 0;
  let totalGst = 0;

  const itemBreakdown = items.map((item) => {
    const gstRate = item.gstRate || 0;

    const cessRate = item.cess || 0;

    const divisor =
      1 +
      gstRate / 100 +
      cessRate / 100;

    const taxableValue = +(
      item.price / divisor
    ).toFixed(2);

    const cessAmount = +(
      (taxableValue * cessRate) / 100
    ).toFixed(2);

    const cgst = +(
      (taxableValue * (gstRate / 2)) / 100
    ).toFixed(2);

    const sgst = cgst;

    const gstAmount = +(
      cgst + sgst + cessAmount
    ).toFixed(2);

    totalTaxableValue += taxableValue;
    totalCgst += cgst;
    totalSgst += sgst;
    totalCess += cessAmount;
    totalGst += gstAmount;

    return {
      name: item.name,

      hsn: item.hsn || "",

      quantity: item.quantity,

      unit: item.unit || "pcs",

      mrp:
        item.mrp || item.unitPrice,

      unitPrice: item.unitPrice,

      gstRate: `${gstRate}%`,

      cessRate: `${cessRate}%`,

      taxableValue:
        +taxableValue.toFixed(2),

      cgst: +cgst.toFixed(2),

      sgst: +sgst.toFixed(2),

      cess: +cessAmount.toFixed(2),

      totalGst:
        +gstAmount.toFixed(2),

      lineTotal: item.price,
    };
  });

  return {
    itemBreakdown,

    totals: {
      taxableValue:
        +totalTaxableValue.toFixed(2),

      cgst:
        +totalCgst.toFixed(2),

      sgst:
        +totalSgst.toFixed(2),

      cess:
        +totalCess.toFixed(2),

      totalGst:
        +totalGst.toFixed(2),
    },
  };
});

// ─── PAYMENT STATUS AUTO ─────────────────────
OrderSchema.pre("save", function (next) {
  const paid =
    this.paidAmount || 0;

  const effective =
    this.finalPrice ??
    this.totalPrice ??
    0;

  if (paid <= 0) {
    this.paymentStatus = "unpaid";
  } else if (paid >= effective) {
    this.paymentStatus = "paid";
  } else {
    this.paymentStatus = "partial";
  }

  next();
});

module.exports = mongoose.model(
  "Order",
  OrderSchema
);