
// const GstRate = require("../models/GstRate");

// exports.setGST = async (req, res) => {
//   const { productId, gstPercent, hsnCode, taxType } = req.body;

//   const gst = await GstRate.findOneAndUpdate(
//     { product: productId },
//     { gstPercent, hsnCode, taxType },
//     { upsert: true, new: true }
//   );

//   res.json({ success: true, gst });
// };

const GstRate = require("../models/GstRate");

/* ======================================================
   CREATE/UPDATE GST RULE
====================================================== */
exports.setGST = async (req, res) => {
  try {
    const { productId, gstPercent, hsnCode, taxType } = req.body;

    /* ===== VALIDATION ===== */
    if (!productId || gstPercent === undefined || !hsnCode) {
      return res.status(400).json({
        success: false,
        message: "Product, GST Percent and HSN Code are required",
      });
    }

    if (gstPercent < 0 || gstPercent > 100) {
      return res.status(400).json({
        success: false,
        message: "GST Percent must be between 0 and 100",
      });
    }

    if (!["cgst_sgst", "igst"].includes(taxType)) {
      return res.status(400).json({
        success: false,
        message: "Tax type must be either 'cgst_sgst' or 'igst'",
      });
    }

    /* ===== CREATE OR UPDATE ===== */
    const gst = await GstRate.findOneAndUpdate(
      { product: productId },
      { 
        product: productId,
        gstPercent, 
        hsnCode, 
        taxType 
      },
      { upsert: true, new: true }
    ).populate("product", "name");

    return res.json({ 
      success: true, 
      message: "GST configuration saved successfully",
      data: gst 
    });

  } catch (err) {
    console.error("Set GST Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save GST configuration",
    });
  }
};

/* ======================================================
   GET ALL GST RULES
====================================================== */
exports.getAllGST = async (req, res) => {
  try {
    const gstRules = await GstRate.find()
      .populate("product", "name")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: gstRules.length,
      data: gstRules,
    });
  } catch (err) {
    console.error("Get All GST Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST rules",
    });
  }
};

/* ======================================================
   GET SINGLE GST RULE
====================================================== */
exports.getGSTById = async (req, res) => {
  try {
    const gst = await GstRate.findById(req.params.id)
      .populate("product", "name");

    if (!gst) {
      return res.status(404).json({
        success: false,
        message: "GST rule not found",
      });
    }

    return res.json({
      success: true,
      data: gst,
    });
  } catch (err) {
    console.error("Get GST By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST rule",
    });
  }
};

/* ======================================================
   GET GST BY PRODUCT
====================================================== */
exports.getGSTByProduct = async (req, res) => {
  try {
    const gst = await GstRate.findOne({ product: req.params.productId })
      .populate("product", "name");

    if (!gst) {
      return res.status(404).json({
        success: false,
        message: "GST rule not found for this product",
      });
    }

    return res.json({
      success: true,
      data: gst,
    });
  } catch (err) {
    console.error("Get GST By Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST rule",
    });
  }
};

/* ======================================================
   UPDATE GST RULE
====================================================== */
exports.updateGST = async (req, res) => {
  try {
    const { gstPercent, hsnCode, taxType } = req.body;

    const gst = await GstRate.findById(req.params.id);
    
    if (!gst) {
      return res.status(404).json({
        success: false,
        message: "GST rule not found",
      });
    }

    /* ===== VALIDATION ===== */
    if (gstPercent !== undefined && (gstPercent < 0 || gstPercent > 100)) {
      return res.status(400).json({
        success: false,
        message: "GST Percent must be between 0 and 100",
      });
    }

    if (taxType && !["cgst_sgst", "igst"].includes(taxType)) {
      return res.status(400).json({
        success: false,
        message: "Tax type must be either 'cgst_sgst' or 'igst'",
      });
    }

    /* ===== UPDATE ===== */
    gst.gstPercent = gstPercent ?? gst.gstPercent;
    gst.hsnCode = hsnCode ?? gst.hsnCode;
    gst.taxType = taxType ?? gst.taxType;

    await gst.save();

    const updatedGst = await GstRate.findById(gst._id)
      .populate("product", "name");

    return res.json({
      success: true,
      message: "GST rule updated successfully",
      data: updatedGst,
    });

  } catch (err) {
    console.error("Update GST Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update GST rule",
    });
  }
};

/* ======================================================
   DELETE GST RULE
====================================================== */
exports.deleteGST = async (req, res) => {
  try {
    const gst = await GstRate.findByIdAndDelete(req.params.id);

    if (!gst) {
      return res.status(404).json({
        success: false,
        message: "GST rule not found",
      });
    }

    return res.json({
      success: true,
      message: "GST rule deleted successfully",
    });
  } catch (err) {
    console.error("Delete GST Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete GST rule",
    });
  }
};