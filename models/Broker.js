const mongoose = require("mongoose");

const brokerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { type: String },
  location: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  password: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Broker", brokerSchema);
