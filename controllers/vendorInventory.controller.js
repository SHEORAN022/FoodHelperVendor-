// const VendorInventory = require("../models/VendorInventory");
// const VendorProduct = require("../models/vendorProduct");

// /* ======================================================
//    CREATE / UPDATE INVENTORY
// ====================================================== */
// exports.upsertInventory = async (req, res) => {
//   try {
//     const { productId, totalStock, minStock } = req.body;

//     if (!productId || totalStock === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Product and stock required",
//       });
//     }

//     const product = await VendorProduct.findOne({
//       _id: productId,
//       vendor: req.vendor.id,
//     });

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let inventory = await VendorInventory.findOne({
//       vendor: req.vendor.id,
//       product: productId,
//     });

//     if (inventory) {
//       inventory.totalStock = totalStock;
//       inventory.availableStock = totalStock;
//       if (minStock !== undefined) inventory.minStock = minStock;
//     } else {
//       inventory = await VendorInventory.create({
//         vendor: req.vendor.id,
//         product: productId,
//         totalStock,
//         availableStock: totalStock,
//         minStock: minStock || 5,
//       });
//     }

//     inventory.outOfStock = inventory.availableStock <= 0;
//     await inventory.save();

//     res.json({
//       success: true,
//       message: "Inventory updated",
//       data: inventory,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ======================================================
//    GET INVENTORY LIST
// ====================================================== */
// exports.getInventory = async (req, res) => {
//   try {
//     const inventory = await VendorInventory.find({
//       vendor: req.vendor.id,
//     })
//       .populate("product", "name image basePrice salePrice")
//       .sort({ updatedAt: -1 });

//     res.json({ success: true, data: inventory });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


const VendorInventory = require("../models/VendorInventory");
const VendorProduct = require("../models/vendorProduct");

/* ══════════════════════════════════════════
   1. GET ALL INVENTORY  →  GET /
══════════════════════════════════════════ */
exports.getInventory = async (req, res) => {
  try {
    const inventory = await VendorInventory.find({ vendor: req.vendor.id })
      .populate("product", "name image basePrice salePrice")
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   2. GET SINGLE INVENTORY  →  GET /:id
══════════════════════════════════════════ */
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    }).populate("product", "name image basePrice salePrice");

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   3. CREATE INVENTORY  →  POST /
══════════════════════════════════════════ */
exports.createInventory = async (req, res) => {
  try {
    const { productId, totalStock, minStock } = req.body;

    if (!productId || totalStock === undefined) {
      return res.status(400).json({ success: false, message: "Product and totalStock are required" });
    }

    // Verify product belongs to this vendor
    const product = await VendorProduct.findOne({ _id: productId, vendor: req.vendor.id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Prevent duplicate inventory for same product
    const existing = await VendorInventory.findOne({ vendor: req.vendor.id, product: productId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Inventory already exists for this product. Use update instead.",
      });
    }

    const inventory = await VendorInventory.create({
      vendor: req.vendor.id,
      product: productId,
      totalStock: Number(totalStock),
      availableStock: Number(totalStock),
      minStock: minStock !== undefined ? Number(minStock) : 5,
      outOfStock: Number(totalStock) <= 0,
    });

    const populated = await inventory.populate("product", "name image basePrice salePrice");

    res.status(201).json({ success: true, message: "Inventory created", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   4. UPDATE INVENTORY  →  PUT /:id
   (Updates totalStock, availableStock, minStock)
══════════════════════════════════════════ */
exports.updateInventory = async (req, res) => {
  try {
    const { totalStock, minStock } = req.body;

    if (totalStock === undefined) {
      return res.status(400).json({ success: false, message: "totalStock is required" });
    }

    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    });

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    inventory.totalStock = Number(totalStock);
    inventory.availableStock = Number(totalStock);
    if (minStock !== undefined) inventory.minStock = Number(minStock);
    inventory.outOfStock = inventory.availableStock <= 0;

    await inventory.save();

    const populated = await inventory.populate("product", "name image basePrice salePrice");

    res.json({ success: true, message: "Inventory updated", data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   5. DELETE INVENTORY  →  DELETE /:id
══════════════════════════════════════════ */
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await VendorInventory.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor.id,
    });

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    res.json({ success: true, message: "Inventory deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════
   6. RESTOCK (Add to existing stock)  →  PATCH /:id/restock
══════════════════════════════════════════ */
exports.restockInventory = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be a positive number" });
    }

    const inventory = await VendorInventory.findOne({
      _id: req.params.id,
      vendor: req.vendor.id,
    });

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    inventory.totalStock += Number(quantity);
    inventory.availableStock += Number(quantity);
    inventory.outOfStock = inventory.availableStock <= 0;

    await inventory.save();

    const populated = await inventory.populate("product", "name image basePrice salePrice");

    res.json({ success: true, message: `${quantity} units added to stock`, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};