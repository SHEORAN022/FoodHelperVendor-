const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: null,
    },

    password: {
      type: String,
      required: true, // ✅ NOW REQUIRED
      minlength: 6,
      select: false, // 🔐 hide by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
