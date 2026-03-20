const Description = require("../models/descriptionModel");

// CREATE
exports.createDescription = async (req, res) => {
  try {
    const { title, description } = req.body;

    const item = await Description.create({ title, description });

    res.status(201).json({
      success: true,
      message: "Description saved",
      data: item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
exports.getDescriptions = async (req, res) => {
  try {
    const items = await Description.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateDescription = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;

    const updated = await Description.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    res.json({ success: true, message: "Updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteDescription = async (req, res) => {
  try {
    await Description.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
