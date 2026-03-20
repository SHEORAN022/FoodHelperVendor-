const Rider = require("../models/Rider");

// CREATE
exports.createRider = async (req, res) => {
  try {
    const rider = await Rider.create(req.body);
    res.json({ success: true, data: rider });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// READ ALL
exports.getRiders = async (req, res) => {
  const riders = await Rider.find().sort({ createdAt: -1 });
  res.json({ success: true, data: riders });
};

// UPDATE
exports.updateRider = async (req, res) => {
  const rider = await Rider.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, data: rider });
};

// DELETE
exports.deleteRider = async (req, res) => {
  await Rider.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
