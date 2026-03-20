const Inventory = require("../models/Inventory");

/* ======================
   ADD / UPDATE INVENTORY
====================== */
exports.setInventory = async (req, res) => {
  try {
    const {
      product,
      sku,
      hsnCode,
      stock,
      minStock,
      costPrice,
      sellingPrice,
      gstPercent
    } = req.body;

    if (!product) {
      return res.status(400).json({ success: false, message: "Product required" });
    }

    let inv = await Inventory.findOne({ product });

    if (inv) {
      inv.sku = sku;
      inv.hsnCode = hsnCode;
      inv.stock = stock;
      inv.minStock = minStock;
      inv.costPrice = costPrice;
      inv.sellingPrice = sellingPrice;
      inv.gstPercent = gstPercent;
      await inv.save();
    } else {
      inv = await Inventory.create({
        product,
        sku,
        hsnCode,
        stock,
        minStock,
        costPrice,
        sellingPrice,
        gstPercent
      });
    }

    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ======================
   GET ALL INVENTORY
====================== */
exports.getInventory = async (req, res) => {
  const data = await Inventory.find().populate("product", "name");
  res.json({ success: true, data });
};


/* ======================
   LOW STOCK
====================== */
exports.lowStock = async (req, res) => {
  const data = await Inventory.find({
    $expr: { $lte: ["$stock", "$minStock"] }
  }).populate("product", "name");

  res.json({ success: true, data });
};
