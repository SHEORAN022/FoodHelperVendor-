const VendorInventory = require("../models/VendorInventory");
const VendorProduct   = require("../models/vendorProduct");

const toNum = (v, fb = 0) => { const n = Number(v); return isNaN(n) ? fb : n; };

/* ─── Shared smart sort: critical items first ─── */
const smartSort = (a, b) => {
  const score = (x) => {
    let s = 0;
    if (x.outOfStock)                            s += 1000;
    else if (x.availableStock <= x.minStock)     s += 500;
    if (x.expiryDate) {
      const d = Math.ceil((new Date(x.expiryDate) - Date.now()) / 86400000);
      if (d <= 0)       s += 800;
      else if (d <= 7)  s += 400;
      else if (d <= 30) s += 200;
    }
    return s;
  };
  const diff = score(b) - score(a);
  if (diff !== 0) return diff;
  if (a.expiryDate && b.expiryDate)
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  if (a.expiryDate) return -1;
  if (b.expiryDate) return  1;
  return new Date(b.updatedAt) - new Date(a.updatedAt);
};

/* ══════════════════════════════════════════
   1. GET ALL INVENTORY  →  GET /
   Query: ?search=&status=OK|LOW|OUT_OF_STOCK|EXPIRING
══════════════════════════════════════════ */
exports.getInventory = async (req, res) => {
  try {
    const { search, status } = req.query;

    let inventory = await VendorInventory.find({ vendor: req.vendor.id })
      .populate("product", "name image basePrice salePrice")
      .lean();

    inventory = inventory.filter((x) => x.product && x.product._id);

    if (search) {
      const q = search.toLowerCase();
      inventory = inventory.filter((i) =>
        i.product?.name?.toLowerCase().includes(q)
      );
    }

    if (status) {
      const now = Date.now();
      inventory = inventory.filter((i) => {
        const days = i.expiryDate
          ? Math.ceil((new Date(i.expiryDate) - now) / 86400000)
          : null;
        if (status === "OUT_OF_STOCK") return i.outOfStock;
        if (status === "LOW")          return !i.outOfStock && i.availableStock <= i.minStock;
        if (status === "OK")           return !i.outOfStock && i.availableStock > i.minStock;
        if (status === "EXPIRING")     return days !== null && days <= 30 && !i.outOfStock;
        return true;
      });
    }

    inventory.sort(smartSort);
    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   2. GET SINGLE  →  GET /:id
══════════════════════════════════════════ */
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    }).populate("product", "name image basePrice salePrice");

    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   3. CREATE  →  POST /
   Body: { productId, totalStock, minStock, expiryDate, batches[] }
   batches: [{ batchNo, mfgDate, expiryDate, qty }]
══════════════════════════════════════════ */
exports.createInventory = async (req, res) => {
  try {
    const { productId, totalStock, minStock, expiryDate, batches } = req.body;

    if (!productId)
      return res.status(400).json({ success: false, message: "productId required" });

    // Verify product belongs to this vendor
    const product = await VendorProduct.findOne({ _id: productId, vendor: req.vendor.id });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // Prevent duplicate
    const existing = await VendorInventory.findOne({
      vendor: req.vendor.id, product: productId,
    });
    if (existing)
      return res.status(409).json({
        success: false,
        message: "Inventory already exists for this product. Use update instead.",
      });

    // ── Batch or legacy mode ───────────────────────────────────────────────
    let processedBatches = [];
    let stockNum;

    if (Array.isArray(batches) && batches.length > 0) {
      processedBatches = batches
        .filter((b) => b.qty && Number(b.qty) > 0)
        .map((b) => ({
          batchNo:    (b.batchNo || "").trim(),
          mfgDate:    b.mfgDate    || null,
          expiryDate: b.expiryDate || null,
          qty:        toNum(b.qty),
        }));
      stockNum = processedBatches.reduce((s, b) => s + b.qty, 0);
    } else {
      if (totalStock === undefined)
        return res.status(400).json({ success: false, message: "totalStock or batches required" });
      stockNum = toNum(totalStock);
    }

    const inventory = await VendorInventory.create({
      vendor:         req.vendor.id,
      product:        productId,
      totalStock:     stockNum,
      availableStock: stockNum,
      minStock:       minStock !== undefined ? toNum(minStock) : 5,
      outOfStock:     stockNum <= 0,
      expiryDate:     (!batches || batches.length === 0) ? (expiryDate || null) : undefined,
      batches:        processedBatches,
    });

    const populated = await inventory.populate("product", "name image basePrice salePrice");
    res.status(201).json({ success: true, message: "Inventory created", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   4. UPDATE  →  PUT /:id
   Body: { totalStock, minStock, expiryDate, batches[] }
   Agar batches bhejo → batch mode (replaces all batches)
   Agar sirf totalStock bhejo → legacy mode
══════════════════════════════════════════ */
exports.updateInventory = async (req, res) => {
  try {
    const { totalStock, minStock, expiryDate, batches } = req.body;

    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    });
    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    if (Array.isArray(batches) && batches.length > 0) {
      // ── Batch mode ─────────────────────────────────────────────────────
      inventory.batches = batches
        .filter((b) => b.qty && Number(b.qty) > 0)
        .map((b) => ({
          batchNo:    (b.batchNo || "").trim(),
          mfgDate:    b.mfgDate    || null,
          expiryDate: b.expiryDate || null,
          qty:        toNum(b.qty),
        }));
      // pre-save hook will recalculate totalStock, availableStock, expiryDate
    } else {
      // ── Legacy mode ────────────────────────────────────────────────────
      if (totalStock === undefined)
        return res.status(400).json({ success: false, message: "totalStock or batches required" });
      inventory.totalStock     = toNum(totalStock);
      inventory.availableStock = toNum(totalStock);
      inventory.batches        = [];
      if (expiryDate !== undefined) inventory.expiryDate = expiryDate || null;
    }

    if (minStock !== undefined) inventory.minStock = toNum(minStock);
    await inventory.save();

    const populated = await inventory.populate("product", "name image basePrice salePrice");
    res.json({ success: true, message: "Inventory updated", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   5. DELETE  →  DELETE /:id
══════════════════════════════════════════ */
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await VendorInventory.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor.id,
    });
    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    res.json({ success: true, message: "Inventory deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   6. RESTOCK  →  PATCH /:id/restock
   Body: { quantity, batchNo, mfgDate, expiryDate }
   Adds a new batch OR increments simple stock
══════════════════════════════════════════ */
exports.restockInventory = async (req, res) => {
  try {
    const { quantity, batchNo, mfgDate, expiryDate } = req.body;

    if (!quantity || toNum(quantity) <= 0)
      return res.status(400).json({ success: false, message: "Quantity must be a positive number" });

    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    });
    if (!inventory)
      return res.status(404).json({ success: false, message: "Inventory not found" });

    const qty = toNum(quantity);

    if (inventory.batches && inventory.batches.length > 0) {
      // Batch mode: add a new batch
      inventory.batches.push({
        batchNo:    (batchNo || "").trim(),
        mfgDate:    mfgDate    || null,
        expiryDate: expiryDate || null,
        qty,
      });
      // pre-save recalculates totalStock, availableStock, expiryDate
    } else {
      // Legacy mode: simple add
      inventory.totalStock     += qty;
      inventory.availableStock += qty;
      if (expiryDate !== undefined) inventory.expiryDate = expiryDate || null;
    }

    await inventory.save();
    const populated = await inventory.populate("product", "name image basePrice salePrice");
    res.json({ success: true, message: `${qty} units added to stock`, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   7. BATCH UPSERT  →  POST /batch
   Body: { items: [{ productId, totalStock, minStock, expiryDate, note, batches[] }] }
══════════════════════════════════════════ */
exports.batchUpsertInventory = async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "items[] required" });

    const results = { created: [], updated: [], failed: [] };

    for (const item of items) {
      const { productId, totalStock, minStock, expiryDate, note, batches } = item;

      if (!productId) {
        results.failed.push({ productId, reason: "productId required" });
        continue;
      }

      try {
        const product = await VendorProduct.findOne({ _id: productId, vendor: req.vendor.id });
        if (!product) {
          results.failed.push({ productId, reason: "Product not found" });
          continue;
        }

        // ── Batch or legacy mode ──────────────────────────────────────────
        let processedBatches = [];
        let stockNum;

        if (Array.isArray(batches) && batches.length > 0) {
          processedBatches = batches
            .filter((b) => b.qty && Number(b.qty) > 0)
            .map((b) => ({
              batchNo:    (b.batchNo || "").trim(),
              mfgDate:    b.mfgDate    || null,
              expiryDate: b.expiryDate || null,
              qty:        toNum(b.qty),
            }));
          stockNum = processedBatches.reduce((s, b) => s + b.qty, 0);
        } else {
          stockNum = toNum(totalStock);
        }

        const existing = await VendorInventory.findOne({
          vendor: req.vendor.id, product: productId,
        });

        if (existing) {
          if (processedBatches.length > 0) {
            existing.batches = processedBatches;
          } else {
            existing.totalStock     = stockNum;
            existing.availableStock = stockNum;
            existing.batches        = [];
            if (expiryDate !== undefined) existing.expiryDate = expiryDate || null;
          }
          if (minStock !== undefined) existing.minStock = toNum(minStock);
          await existing.save();
          const pop = await existing.populate("product", "name image");
          results.updated.push(pop);
        } else {
          const inv = await VendorInventory.create({
            vendor:         req.vendor.id,
            product:        productId,
            totalStock:     stockNum,
            availableStock: stockNum,
            minStock:       minStock !== undefined ? toNum(minStock) : 5,
            outOfStock:     stockNum <= 0,
            expiryDate:     processedBatches.length === 0 ? (expiryDate || null) : undefined,
            batches:        processedBatches,
          });
          const pop = await inv.populate("product", "name image");
          results.created.push(pop);
        }
      } catch (innerErr) {
        results.failed.push({ productId, reason: innerErr.message });
      }
    }

    res.json({
      success: true,
      message: `${results.created.length} created, ${results.updated.length} updated, ${results.failed.length} failed`,
      data: results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   8. EXPIRING SOON  →  GET /expiring?days=30
══════════════════════════════════════════ */
exports.getExpiring = async (req, res) => {
  try {
    const days = toNum(req.query.days, 30);
    const soon = new Date(Date.now() + days * 86400000);
    const now  = new Date();

    const inventory = await VendorInventory.find({
      vendor:     req.vendor.id,
      expiryDate: { $lte: soon, $gte: now },
      outOfStock: false,
    })
      .populate("product", "name image basePrice salePrice")
      .sort({ expiryDate: 1 });

    res.json({ success: true, count: inventory.length, days, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   9. LOW STOCK  →  GET /low
══════════════════════════════════════════ */
exports.getLowStock = async (req, res) => {
  try {
    const inventory = await VendorInventory.find({
      vendor: req.vendor.id,
      $expr:  { $lte: ["$availableStock", "$minStock"] },
    })
      .populate("product", "name image basePrice salePrice")
      .sort({ availableStock: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};