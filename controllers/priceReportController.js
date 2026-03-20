const Price = require("../models/Price");

// 📊 Product-wise or Category-wise price trends
exports.getPriceTrends = async (req, res) => {
  try {
    const { type, range } = req.query; // type: "product" | "category", range: "weekly" | "monthly"
    const matchField = type === "category" ? "$category" : "$name";

    const dateFilter =
      range === "monthly"
        ? { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        : { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) };

    const trends = await Price.aggregate([
      { $match: { date: dateFilter } },
      {
        $group: {
          _id: { field: matchField, date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
          avgPrice: { $avg: "$price" },
        },
      },
      {
        $group: {
          _id: "$_id.field",
          prices: { $push: { date: "$_id.date", avgPrice: "$avgPrice" } },
        },
      },
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
