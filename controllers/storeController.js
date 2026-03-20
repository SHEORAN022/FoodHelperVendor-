const Store = require("../models/Store");

// CREATE
exports.createStore = async (req, res) => {
  try {
    const store = await Store.create(req.body);
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ ALL
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.json({ success: true, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteStore = async (req, res) => {
  try {
    await Store.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Store deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
