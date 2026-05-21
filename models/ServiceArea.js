
const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ DELIVERY CHARGE
    deliveryCharge: {
      type: Number,
      default: 0,
    },

    // ✅ HANDLING CHARGE
    handlingCharge: {
      type: Number,
      default: 5,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const serviceAreaSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    areas: {
      type: [areaSchema],
      default: [],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ServiceArea ||
  mongoose.model(
    "ServiceArea",
    serviceAreaSchema
  );