
const express = require("express");
const router = express.Router();
const Price = require("../models/Price");

// 🔹 Get price trends (weekly/monthly) for category or product
router.get("/trends", async (req, res) => {
  try {
    const { type = "category", range = "weekly", filter } = req.query;

    // 🔹 Date filter (monthly → 6 months, weekly → 30 days)
    const startDate =
      range === "monthly"
        ? new Date(new Date().setMonth(new Date().getMonth() - 5))
        : new Date(new Date().setDate(new Date().getDate() - 30));

    // 🔹 Create match filter
    const matchStage = { createdAt: { $gte: startDate } };
    if (filter) {
      if (type === "category") matchStage.category = filter;
      else matchStage.name = filter;
    }

    // 🔹 Group field (either category or product name)
    const groupField = type === "category" ? "$category" : "$name";

    // 🔹 MongoDB aggregation pipeline
    const data = await Price.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            group: groupField,
            date:
              range === "monthly"
                ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          avgPrice: { $avg: "$price" },
        },
      },
      {
        $group: {
          _id: "$_id.group",
          prices: {
            $push: {
              date: "$_id.date",
              avgPrice: { $round: ["$avgPrice", 2] },
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Error in price-report/trends:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
