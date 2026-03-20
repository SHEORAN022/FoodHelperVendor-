const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  websiteActive: {
    type: Boolean,
    default: true, // true = show products
  },
});

module.exports = mongoose.model("Setting", settingSchema);
