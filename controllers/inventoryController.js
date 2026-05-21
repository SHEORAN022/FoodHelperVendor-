const Inventory       = require("../models/Inventory");
const InventoryLedger = require("../models/inventoryledger");

const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

/* ════════════════════════════════════════
   CREATE  —  POST /api/inventory
   Body: { product, stock, minStock, expiryDate }
════════════════════════════════════════ */
exports.createInventory = async (req, res) => {
  try {
    const { product, stock, minStock, expiryDate } = req.body;
    if (!product) return res.status(400).json({ success: false, message: "Product required" });

    const exists = await Inventory.findOne({ product });
    if (exists)
      return res.status(409).json({ success: false, message: "Product already exists in inventory. Use update instead." });

    const stockNum = toNum(stock);
    const inv = await Inventory.create({
      product,
      stock:      stockNum,
      minStock:   toNum(minStock),
      expiryDate: expiryDate || undefined,
    });

    if (stockNum > 0) {
      await InventoryLedger.create({ product, type: "INWARD", qty: stockNum, note: "Opening stock" });
    }

    const populated = await Inventory.findById(inv._id).populate("product", "name image");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   READ ALL  —  GET /api/inventory
   Query: ?search=&status=OK|LOW|OUT_OF_STOCK
════════════════════════════════════════ */
exports.getInventory = async (req, res) => {
  try {
    const { search, status } = req.query;

    let data = await Inventory.find()
      .populate("product", "name image")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(i => i.product?.name?.toLowerCase().includes(q));
    }

    if (status) {
      data = data.filter(i => {
        if (status === "OUT_OF_STOCK") return i.stock === 0;
        if (status === "LOW")          return i.stock > 0 && i.stock <= i.minStock;
        if (status === "OK")           return i.stock > i.minStock;
        return true;
      });
    }

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   READ ONE  —  GET /api/inventory/:id
════════════════════════════════════════ */
exports.getInventoryById = async (req, res) => {
  try {
    const inv = await Inventory.findById(req.params.id).populate("product", "name image");
    if (!inv) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   UPDATE  —  PUT /api/inventory/:id
   Body: { stock, minStock, expiryDate }
   Auto-creates a ledger entry if stock changes.
════════════════════════════════════════ */
exports.updateInventory = async (req, res) => {
  try {
    const inv = await Inventory.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Not found" });

    const { stock, minStock, expiryDate } = req.body;
    const newStock = stock !== undefined ? toNum(stock) : inv.stock;
    const diff     = newStock - inv.stock;

    inv.stock      = newStock;
    inv.minStock   = minStock   !== undefined ? toNum(minStock) : inv.minStock;
    inv.expiryDate = expiryDate !== undefined ? (expiryDate || undefined) : inv.expiryDate;
    await inv.save();

    if (diff !== 0) {
      await InventoryLedger.create({
        product: inv.product,
        qty:     Math.abs(diff),
        type:    diff > 0 ? "INWARD" : "OUTWARD",
        note:    "Manual stock adjustment",
      });
    }

    const populated = await Inventory.findById(inv._id).populate("product", "name image");
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   DELETE  —  DELETE /api/inventory/:id
   Also removes all ledger entries for this product.
════════════════════════════════════════ */
exports.deleteInventory = async (req, res) => {
  try {
    const inv = await Inventory.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Not found" });

    await InventoryLedger.deleteMany({ product: inv.product });
    await inv.deleteOne();

    res.json({ success: true, message: "Inventory and ledger entries deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   BATCH UPSERT  —  POST /api/inventory/batch
   Body: { items: [{ product, stock, minStock, expiryDate, note }] }
════════════════════════════════════════ */
exports.batchSetInventory = async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "items[] required" });

    const results = [];

    for (const item of items) {
      const { product, stock, minStock, expiryDate, note } = item;
      if (!product) continue;

      const stockNum = toNum(stock);
      let inv = await Inventory.findOne({ product });

      if (inv) {
        const diff = stockNum - inv.stock;
        inv.stock      = stockNum;
        inv.minStock   = toNum(minStock, inv.minStock);
        inv.expiryDate = expiryDate || inv.expiryDate;
        await inv.save();

        if (diff !== 0) {
          await InventoryLedger.create({
            product,
            qty:  Math.abs(diff),
            type: diff > 0 ? "INWARD" : "OUTWARD",
            note: note || "Batch adjustment",
          });
        }
      } else {
        inv = await Inventory.create({ product, stock: stockNum, minStock: toNum(minStock), expiryDate });
        if (stockNum > 0) {
          await InventoryLedger.create({ product, type: "INWARD", qty: stockNum, note: note || "Batch opening stock" });
        }
      }

      results.push(inv);
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   ADD LEDGER ENTRY  —  POST /api/inventory/ledger
   Body: { product, type, qty, note }
════════════════════════════════════════ */
exports.addLedgerEntry = async (req, res) => {
  try {
    const { product, type, qty, note } = req.body;
    if (!product || !type || !qty)
      return res.status(400).json({ success: false, message: "product, type, qty required" });

    const qtyNum   = toNum(qty);
    const typeUpper = type.toUpperCase();

    if (qtyNum <= 0)
      return res.status(400).json({ success: false, message: "qty must be > 0" });
    if (!["INWARD", "OUTWARD"].includes(typeUpper))
      return res.status(400).json({ success: false, message: "type must be INWARD or OUTWARD" });

    const inv = await Inventory.findOne({ product });
    if (!inv)
      return res.status(404).json({ success: false, message: "Product not found in inventory. Pehle add karo." });

    if (typeUpper === "OUTWARD" && inv.stock < qtyNum)
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${inv.stock}` });

    inv.stock = inv.stock + (typeUpper === "INWARD" ? qtyNum : -qtyNum);
    await inv.save();

    const entry     = await InventoryLedger.create({ product, type: typeUpper, qty: qtyNum, note });
    const populated = await InventoryLedger.findById(entry._id).populate("product", "name");

    res.json({ success: true, data: { entry: populated, updatedStock: inv.stock } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   GET LEDGER  —  GET /api/inventory/ledger
   Query: ?product=&type=INWARD|OUTWARD&limit=200&page=1
════════════════════════════════════════ */
exports.getLedger = async (req, res) => {
  try {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.type)    filter.type    = req.query.type.toUpperCase();

    const limit = Math.min(toNum(req.query.limit, 200), 1000);
    const page  = Math.max(toNum(req.query.page,  1),   1);
    const skip  = (page - 1) * limit;
    const total = await InventoryLedger.countDocuments(filter);

    const data = await InventoryLedger.find(filter)
      .populate("product", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, total, page, limit, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   DELETE LEDGER ENTRY  —  DELETE /api/inventory/ledger/:id
   WARNING: Does NOT reverse stock change. Admin use only.
════════════════════════════════════════ */
exports.deleteLedgerEntry = async (req, res) => {
  try {
    const entry = await InventoryLedger.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, message: "Ledger entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════
   REPORTS
════════════════════════════════════════ */
exports.stockReport = async (req, res) => {
  try {
    const allInv = await Inventory.find().populate("product", "name image");

    const ledgerAgg = await InventoryLedger.aggregate([
      { $match: { product: { $in: allInv.map(i => i.product._id) } } },
      { $group: { _id: { product: "$product", type: "$type" }, total: { $sum: "$qty" } } },
    ]);

    const agg = {};
    ledgerAgg.forEach(({ _id, total }) => {
      const pid = String(_id.product);
      if (!agg[pid]) agg[pid] = { INWARD: 0, OUTWARD: 0 };
      agg[pid][_id.type] = total;
    });

    const report = allInv.map(inv => {
      const pid = String(inv.product._id);
      return {
        product:      inv.product,
        totalInward:  agg[pid]?.INWARD  || 0,
        totalOutward: agg[pid]?.OUTWARD || 0,
        currentStock: inv.stock,
        minStock:     inv.minStock,
        expiryDate:   inv.expiryDate,
        status:
          inv.stock === 0             ? "OUT_OF_STOCK"
          : inv.stock <= inv.minStock ? "LOW"
          : "OK",
      };
    });

    report.sort((a, b) => {
      const ord = { OUT_OF_STOCK: 0, LOW: 1, OK: 2 };
      return (ord[a.status] ?? 3) - (ord[b.status] ?? 3);
    });

    res.json({ success: true, count: report.length, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.lowStock = async (req, res) => {
  try {
    const data = await Inventory.find({ $expr: { $lte: ["$stock", "$minStock"] } })
      .populate("product", "name image");
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deadStock = async (req, res) => {
  try {
    const days  = toNum(req.query.days, 30);
    const since = new Date(Date.now() - days * 86400000);
    const activeIds = await InventoryLedger.distinct("product", { type: "OUTWARD", date: { $gte: since } });
    const data = await Inventory.find({ stock: { $gt: 0 }, product: { $nin: activeIds } })
      .populate("product", "name image");
    res.json({ success: true, count: data.length, days, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.expiringStock = async (req, res) => {
  try {
    const days = toNum(req.query.days, 30);
    const soon = new Date(Date.now() + days * 86400000);
    const data = await Inventory.find({
      stock: { $gt: 0 },
      expiryDate: { $lte: soon, $gte: new Date() },
    }).populate("product", "name image").sort({ expiryDate: 1 });
    res.json({ success: true, count: data.length, days, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
