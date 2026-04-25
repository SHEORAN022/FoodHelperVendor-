// const VendorBulkDiscount = require("../models/VendorBulkDiscount");

// exports.createDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     let { product, minQty, maxQty = null, unitPrice } = req.body;

//     minQty    = Number(minQty);
//     maxQty    = maxQty !== null && maxQty !== "" ? Number(maxQty) : null;
//     unitPrice = Number(unitPrice);

//     if (!product || isNaN(minQty) || isNaN(unitPrice)) {
//       return res.status(400).json({
//         success: false,
//         message: "Product, Min Qty and Unit Price are required",
//       });
//     }

//     if (!Number.isInteger(minQty) || minQty < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Min Qty must be an integer >= 1",
//       });
//     }

//     if (maxQty !== null) {
//       if (!Number.isInteger(maxQty) || maxQty < minQty) {
//         return res.status(400).json({
//           success: false,
//           message: "Max Qty must be >= Min Qty",
//         });
//       }
//     }

//     if (unitPrice <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Unit Price must be greater than 0",
//       });
//     }

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

//     const discount = await VendorBulkDiscount.create({
//       vendor: vendorId,
//       product,
//       minQty,
//       maxQty,
//       unitPrice,
//     });

//     const populated = await VendorBulkDiscount.findById(discount._id)
//       .populate("product", "name image basePrice salePrice")
//       .lean();

//     // Attach productId as a top-level string for easy frontend filtering
//     const result = {
//       ...populated,
//       productId: String(populated.product?._id || ""),
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Bulk discount created successfully",
//       data: result,
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
//    GET MY DISCOUNTS (all for this vendor)
// ====================================================== */
// exports.getMyDiscounts = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;

//     const discounts = await VendorBulkDiscount.find({ vendor: vendorId })
//       .populate("product", "name image basePrice salePrice")
//       .sort({ createdAt: -1 })
//       .lean();

//     // Filter out deleted products, attach productId string
//     const valid = discounts
//       .filter((d) => d.product !== null)
//       .map((d) => ({
//         ...d,
//         productId: String(d.product?._id || ""),
//       }));

//     return res.json({
//       success: true,
//       count: valid.length,
//       data: valid,
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
//    GET DISCOUNTS BY PRODUCT ID
// ====================================================== */
// exports.getDiscountsByProduct = async (req, res) => {
//   try {
//     const vendorId  = req.vendor.id;
//     const productId = req.params.productId;

//     const discounts = await VendorBulkDiscount.find({
//       vendor:  vendorId,
//       product: productId,
//     })
//       .populate("product", "name image basePrice salePrice")
//       .sort({ minQty: 1 })
//       .lean();

//     const valid = discounts
//       .filter((d) => d.product !== null)
//       .map((d) => ({
//         ...d,
//         productId: String(d.product?._id || ""),
//       }));

//     return res.json({
//       success: true,
//       count: valid.length,
//       data: valid,
//     });
//   } catch (err) {
//     console.error("Get Discounts By Product Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch discounts for product",
//     });
//   }
// };

// /* ======================================================
//    UPDATE
// ====================================================== */
// exports.updateDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     let { minQty, maxQty, unitPrice, isActive } = req.body;

//     if (minQty !== undefined) minQty = Number(minQty);
//     if (maxQty !== undefined && maxQty !== null && maxQty !== "") maxQty = Number(maxQty);
//     else if (maxQty === "" || maxQty === null) maxQty = null;
//     if (unitPrice !== undefined) unitPrice = Number(unitPrice);

//     const discount = await VendorBulkDiscount.findOne({
//       _id:    req.params.id,
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
//         return res.status(400).json({ success: false, message: "Min Qty must be >= 1" });
//       }
//       discount.minQty = minQty;
//     }

//     if (maxQty !== undefined) {
//       if (maxQty !== null && maxQty < (minQty ?? discount.minQty)) {
//         return res.status(400).json({ success: false, message: "Max Qty must be >= Min Qty" });
//       }
//       discount.maxQty = maxQty;
//     }

//     if (unitPrice !== undefined) {
//       if (unitPrice <= 0) {
//         return res.status(400).json({ success: false, message: "Unit Price must be > 0" });
//       }
//       discount.unitPrice = unitPrice;
//     }

//     if (isActive !== undefined) {
//       discount.isActive = Boolean(isActive);
//     }

//     await discount.save();

//     const populated = await VendorBulkDiscount.findById(discount._id)
//       .populate("product", "name image basePrice salePrice")
//       .lean();

//     const result = {
//       ...populated,
//       productId: String(populated.product?._id || ""),
//     };

//     return res.json({
//       success: true,
//       message: "Bulk discount updated successfully",
//       data: result,
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
//    DELETE
// ====================================================== */
// exports.deleteDiscount = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;

//     const discount = await VendorBulkDiscount.findOneAndDelete({
//       _id:    req.params.id,
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

exports.createDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    let { product, minQty, maxQty = null, unitPrice, profit } = req.body;

    minQty    = Number(minQty);
    maxQty    = maxQty !== null && maxQty !== "" ? Number(maxQty) : null;
    unitPrice = Number(unitPrice);
    profit    = profit !== undefined && profit !== "" ? Number(profit) : null;

    if (!product || isNaN(minQty) || isNaN(unitPrice)) {
      return res.status(400).json({
        success: false,
        message: "Product, Min Qty aur Unit Price required hain",
      });
    }

    if (!Number.isInteger(minQty) || minQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Min Qty integer hona chahiye >= 1",
      });
    }

    if (maxQty !== null) {
      if (!Number.isInteger(maxQty) || maxQty < minQty) {
        return res.status(400).json({
          success: false,
          message: "Max Qty >= Min Qty hona chahiye",
        });
      }
    }

    if (unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price > 0 hona chahiye",
      });
    }

 
    if (profit !== null && profit < 0) {
      console.warn(`[BulkDiscount] Negative profit (${profit}) for product ${product} — tier price below base cost`);
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
      profit: profit !== null ? profit : 0,
    });

    const populated = await VendorBulkDiscount.findById(discount._id)
      .populate("product", "name image basePrice salePrice profit")
      .lean();

    const result = {
      ...populated,
      productId: String(populated.product?._id || ""),
    };

    return res.status(201).json({
      success: true,
      message: "Bulk discount created successfully",
      data: result,
    });
  } catch (err) {
    console.error("Create Vendor Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create bulk discount",
    });
  }
};


exports.getMyDiscounts = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const discounts = await VendorBulkDiscount.find({ vendor: vendorId })
      .populate("product", "name image basePrice salePrice profit")
      .sort({ createdAt: -1 })
      .lean();

    const valid = discounts
      .filter((d) => d.product !== null)
      .map((d) => ({
        ...d,
        productId: String(d.product?._id || ""),
      }));

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


exports.getDiscountsByProduct = async (req, res) => {
  try {
    const vendorId  = req.vendor.id;
    const productId = req.params.productId;

    const discounts = await VendorBulkDiscount.find({
      vendor:  vendorId,
      product: productId,
    })
      .populate("product", "name image basePrice salePrice profit")
      .sort({ minQty: 1 })
      .lean();

    const valid = discounts
      .filter((d) => d.product !== null)
      .map((d) => ({
        ...d,
        productId: String(d.product?._id || ""),
      }));

    return res.json({
      success: true,
      count: valid.length,
      data: valid,
    });
  } catch (err) {
    console.error("Get Discounts By Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch discounts for product",
    });
  }
};

/* ══════════════════════════════════════════════════════════════
   UPDATE DISCOUNT
   PUT /api/vendor/bulk-discounts/:id
   Body: { minQty?, maxQty?, unitPrice?, profit?, isActive? }
══════════════════════════════════════════════════════════════ */
exports.updateDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    let { minQty, maxQty, unitPrice, profit, isActive } = req.body;

    if (minQty !== undefined)    minQty    = Number(minQty);
    if (unitPrice !== undefined) unitPrice = Number(unitPrice);
    if (profit !== undefined && profit !== null && profit !== "")
      profit = Number(profit);
    else if (profit === "" || profit === null)
      profit = null; // keep existing

    if (maxQty !== undefined && maxQty !== null && maxQty !== "")
      maxQty = Number(maxQty);
    else if (maxQty === "" || maxQty === null)
      maxQty = null;

    const discount = await VendorBulkDiscount.findOne({
      _id:    req.params.id,
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
        return res.status(400).json({ success: false, message: "Min Qty >= 1 hona chahiye" });
      }
      discount.minQty = minQty;
    }

    if (maxQty !== undefined) {
      if (maxQty !== null && maxQty < (minQty ?? discount.minQty)) {
        return res.status(400).json({ success: false, message: "Max Qty >= Min Qty hona chahiye" });
      }
      discount.maxQty = maxQty;
    }

    if (unitPrice !== undefined) {
      if (unitPrice <= 0) {
        return res.status(400).json({ success: false, message: "Unit Price > 0 hona chahiye" });
      }
      discount.unitPrice = unitPrice;
    }

    // Update profit if provided
    if (profit !== null && profit !== undefined) {
      discount.profit = profit;
    }

    if (isActive !== undefined) {
      discount.isActive = Boolean(isActive);
    }

    await discount.save();

    const populated = await VendorBulkDiscount.findById(discount._id)
      .populate("product", "name image basePrice salePrice profit")
      .lean();

    const result = {
      ...populated,
      productId: String(populated.product?._id || ""),
    };

    return res.json({
      success: true,
      message: "Bulk discount updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Update Vendor Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update discount",
    });
  }
};

/* ══════════════════════════════════════════════════════════════
   DELETE DISCOUNT
   DELETE /api/vendor/bulk-discounts/:id
══════════════════════════════════════════════════════════════ */
exports.deleteDiscount = async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    const discount = await VendorBulkDiscount.findOneAndDelete({
      _id:    req.params.id,
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