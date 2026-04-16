// const mongoose = require("mongoose");

// const hsnCodeSchema = new mongoose.Schema(
//   {
//     code:        { type: String, required: true, trim: true, unique: true },
//     description: { type: String, required: true, trim: true },
//     category:    { type: String, required: true, trim: true },
//     gst:         { type: Number, required: true, enum: [0, 5, 12, 18, 28] },
//     active:      { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// hsnCodeSchema.index({ code: 1 });
// hsnCodeSchema.index({ category: 1 });

// module.exports = mongoose.model("HsnCode", hsnCodeSchema);


const mongoose = require("mongoose");

const hsnCodeSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    category:    { type: String, required: true, trim: true },
    gst:         { type: Number, required: true, enum: [0, 5, 12, 18, 28] },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

hsnCodeSchema.index({ code: 1 });
hsnCodeSchema.index({ category: 1 });

module.exports = mongoose.models.HsnCode || mongoose.model("HsnCode", hsnCodeSchema);