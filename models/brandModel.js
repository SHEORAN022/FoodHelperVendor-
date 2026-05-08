const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    // 🔹 Brand Name
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // 🔹 Brand Image
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", brandSchema);