const mongoose = require("mongoose");

const unitDefSchema = new mongoose.Schema(
  {
    key: {
      type:      String,
      required:  true,
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    label: {
      type:     String,
      required: true,
      trim:     true,
    },
    multiplier: {
      type:     Number,
      required: true,
      min:      1,
    },
    isDefault: {
      type:    Boolean,
      default: false,
    },
    order: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UnitDef", unitDefSchema);