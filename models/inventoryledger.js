const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Price",
      required: true,
    },
    type: { type: String, enum: ["INWARD", "OUTWARD"], required: true },
    qty:  { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);


module.exports =
  mongoose.models.InventoryLedger ||
  mongoose.model("InventoryLedger", ledgerSchema);

