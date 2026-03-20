const express = require("express");
const router = express.Router();
const PriceHistory = require("../models/priceHistoryModel");

router.get("/", async (req, res) => {
  const data = await PriceHistory.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});

router.get("/:productId", async (req, res) => {
  const data = await PriceHistory.find({ productId: req.params.productId })
    .sort({ createdAt: -1 });

  res.json({ success: true, data });
});

module.exports = router;
