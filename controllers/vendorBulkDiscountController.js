// const VendorBulkDiscount = require("../models/VendorBulkDiscount");

// /* ======================================================
//    CREATE BULK DISCOUNT (VENDOR)
// ====================================================== */
// exports.createDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     let { product, minQty, maxQty = null, unitPrice } = req.body;

//     /* ===== TYPE NORMALIZATION ===== */
//     minQty = Number(minQty);
//     maxQty = maxQty !== null ? Number(maxQty) : null;
//     unitPrice = Number(unitPrice);

//     /* ===== VALIDATION ===== */
//     if (!product || isNaN(minQty) || isNaN(unitPrice)) {
//       return res.status(400).json({
//         success: false,
//         message: "Product, Min Qty and Unit Price are required",
//       });
//     }

//     if (!Number.isInteger(minQty) || minQty < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Min Qty must be an integer ≥ 1",
//       });
//     }

//     if (maxQty !== null) {
//       if (!Number.isInteger(maxQty) || maxQty < minQty) {
//         return res.status(400).json({
//           success: false,
//           message: "Max Qty must be ≥ Min Qty",
//         });
//       }
//     }

//     if (unitPrice <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Unit Price must be greater than 0",
//       });
//     }

//     /* ===== DUPLICATE CHECK ===== */
//     const exists = await VendorBulkDiscount.findOne({
//       vendor: vendorId,
//       product,
//       minQty,
//       maxQty,
//     }).lean();

//     if (exists) {
//       return res.status(409).json({
//         success: false,
//         message: "Bulk discount already exists for this quantity range",
//       });
//     }

//     /* ===== CREATE ===== */
//     const discount = await VendorBulkDiscount.create({
//       vendor: vendorId,
//       product,
//       minQty,
//       maxQty,
//       unitPrice,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Bulk discount created successfully",
//       data: discount,
//     });
//   } catch (err) {
//     console.error("Create Vendor Discount Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create bulk discount",
//     });
//   }
// };

// /* ======================================================
//    GET ALL DISCOUNTS (LOGGED-IN VENDOR)
// ====================================================== */
// exports.getMyDiscounts = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;

//     const discounts = await VendorBulkDiscount.find({ vendor: vendorId })
//       .populate("product", "name basePrice salePrice")
//       .sort({ minQty: 1 })
//       .lean();

//     return res.json({
//       success: true,
//       count: discounts.length,
//       data: discounts,
//     });
//   } catch (err) {
//     console.error("Get Vendor Discounts Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch discounts",
//     });
//   }
// };

// /* ======================================================
//    UPDATE DISCOUNT
// ====================================================== */
// exports.updateDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     let { minQty, maxQty, unitPrice, isActive } = req.body;

//     if (minQty !== undefined) minQty = Number(minQty);
//     if (maxQty !== undefined && maxQty !== null) maxQty = Number(maxQty);
//     if (unitPrice !== undefined) unitPrice = Number(unitPrice);

//     const discount = await VendorBulkDiscount.findOne({
//       _id: req.params.id,
//       vendor: vendorId,
//     });

//     if (!discount) {
//       return res.status(404).json({
//         success: false,
//         message: "Discount not found",
//       });
//     }

//     if (minQty !== undefined) {
//       if (!Number.isInteger(minQty) || minQty < 1) {
//         return res.status(400).json({
//           success: false,
//           message: "Min Qty must be ≥ 1",
//         });
//       }
//       discount.minQty = minQty;
//     }

//     if (maxQty !== undefined) {
//       if (maxQty !== null && maxQty < (minQty ?? discount.minQty)) {
//         return res.status(400).json({
//           success: false,
//           message: "Max Qty must be ≥ Min Qty",
//         });
//       }
//       discount.maxQty = maxQty;
//     }

//     if (unitPrice !== undefined) {
//       if (unitPrice <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Unit Price must be greater than 0",
//         });
//       }
//       discount.unitPrice = unitPrice;
//     }

//     if (isActive !== undefined) {
//       discount.isActive = Boolean(isActive);
//     }

//     await discount.save();

//     return res.json({
//       success: true,
//       message: "Bulk discount updated successfully",
//       data: discount,
//     });
//   } catch (err) {
//     console.error("Update Vendor Discount Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update discount",
//     });
//   }
// };

// /* ======================================================
//    DELETE DISCOUNT
// ====================================================== */
// exports.deleteDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;

//     const discount = await VendorBulkDiscount.findOneAndDelete({
//       _id: req.params.id,
//       vendor: vendorId,
//     });

//     if (!discount) {
//       return res.status(404).json({
//         success: false,
//         message: "Discount not found",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Bulk discount deleted successfully",
//     });
//   } catch (err) {
//     console.error("Delete Vendor Discount Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete discount",
//     });
//   }
// };
const VendorBulkDiscount = require("../models/VendorBulkDiscount");

/* ======================================================
   CREATE
====================================================== */
exports.createDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    let { product, minQty, maxQty = null, unitPrice } = req.body;

    minQty    = Number(minQty);
    maxQty    = maxQty !== null && maxQty !== "" ? Number(maxQty) : null;
    unitPrice = Number(unitPrice);

    if (!product || isNaN(minQty) || isNaN(unitPrice)) {
      return res.status(400).json({
        success: false,
        message: "Product, Min Qty and Unit Price are required",
      });
    }

    if (!Number.isInteger(minQty) || minQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Min Qty must be an integer ≥ 1",
      });
    }

    if (maxQty !== null) {
      if (!Number.isInteger(maxQty) || maxQty < minQty) {
        return res.status(400).json({
          success: false,
          message: "Max Qty must be ≥ Min Qty",
        });
      }
    }

    if (unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be greater than 0",
      });
    }

    const exists = await VendorBulkDiscount.findOne({
      vendor: vendorId,
      product,
      minQty,
      maxQty,
    }).lean();

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Bulk discount already exists for this quantity range",
      });
    }

    const discount = await VendorBulkDiscount.create({
      vendor: vendorId,
      product,
      minQty,
      maxQty,
      unitPrice,
    });

    // Populate karke return karo
    const populated = await VendorBulkDiscount.findById(discount._id)
      .populate("product", "name image basePrice salePrice")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Bulk discount created successfully",
      data: populated,
    });
  } catch (err) {
    console.error("Create Vendor Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create bulk discount",
    });
  }
};

/* ======================================================
   GET MY DISCOUNTS — 🔥 NULL PRODUCT FILTER FIX
====================================================== */
exports.getMyDiscounts = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const discounts = await VendorBulkDiscount.find({ vendor: vendorId })
      .populate("product", "name image basePrice salePrice")
      .sort({ createdAt: -1 })
      .lean();

    // 🔥 KEY FIX: null product (deleted products) ko filter karo
    const valid = discounts.filter((d) => d.product !== null);

    return res.json({
      success: true,
      count: valid.length,
      data: valid,
    });
  } catch (err) {
    console.error("Get Vendor Discounts Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
    });
  }
};

/* ======================================================
   UPDATE
====================================================== */
exports.updateDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    let { minQty, maxQty, unitPrice, isActive } = req.body;

    if (minQty !== undefined)                        minQty    = Number(minQty);
    if (maxQty !== undefined && maxQty !== null && maxQty !== "") maxQty = Number(maxQty);
    else if (maxQty === "" || maxQty === null)       maxQty    = null;
    if (unitPrice !== undefined)                     unitPrice = Number(unitPrice);

    const discount = await VendorBulkDiscount.findOne({
      _id: req.params.id,
      vendor: vendorId,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    if (minQty !== undefined) {
      if (!Number.isInteger(minQty) || minQty < 1) {
        return res.status(400).json({ success: false, message: "Min Qty must be ≥ 1" });
      }
      discount.minQty = minQty;
    }

    if (maxQty !== undefined) {
      if (maxQty !== null && maxQty < (minQty ?? discount.minQty)) {
        return res.status(400).json({ success: false, message: "Max Qty must be ≥ Min Qty" });
      }
      discount.maxQty = maxQty;
    }

    if (unitPrice !== undefined) {
      if (unitPrice <= 0) {
        return res.status(400).json({ success: false, message: "Unit Price must be > 0" });
      }
      discount.unitPrice = unitPrice;
    }

    if (isActive !== undefined) {
      discount.isActive = Boolean(isActive);
    }

    await discount.save();

    const populated = await VendorBulkDiscount.findById(discount._id)
      .populate("product", "name image basePrice salePrice")
      .lean();

    return res.json({
      success: true,
      message: "Bulk discount updated successfully",
      data: populated,
    });
  } catch (err) {
    console.error("Update Vendor Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update discount",
    });
  }
};

/* ======================================================
   DELETE
====================================================== */
exports.deleteDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const discount = await VendorBulkDiscount.findOneAndDelete({
      _id: req.params.id,
      vendor: vendorId,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    return res.json({
      success: true,
      message: "Bulk discount deleted successfully",
    });
  } catch (err) {
    console.error("Delete Vendor Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete discount",
    });
  }
};