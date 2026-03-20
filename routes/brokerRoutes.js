const express = require("express");
const router = express.Router();
const Broker = require("../models/Broker");

// ✅ Add new broker
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, company, location, password } = req.body;
    const broker = await Broker.create({ name, email, phone, company, location, password });
    res.json({ success: true, broker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get all brokers
router.get("/", async (req, res) => {
  try {
    const brokers = await Broker.find().sort({ joinedAt: -1 });
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update broker
router.put("/:id", async (req, res) => {
  try {
    const updated = await Broker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete broker
router.delete("/:id", async (req, res) => {
  try {
    await Broker.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Broker deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
