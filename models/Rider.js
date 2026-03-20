const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    baseLocation: { type: String, default: "" },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "cycle"],
      default: "bike",
    },
    status: {
      type: String,
      enum: ["online", "offline", "on_delivery"],
      default: "offline",
    },
    deliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    earnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);
