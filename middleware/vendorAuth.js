const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

module.exports = async (req, res, next) => {
  try {
    /* ===============================
       GET TOKEN
    =============================== */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    /* ===============================
       VERIFY TOKEN
    =============================== */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    /* ===============================
       FIND VENDOR
    =============================== */
    const vendor = await Vendor.findById(decoded.id).select("-password");

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Vendor not found",
      });
    }

    /* ===============================
       ATTACH TO REQUEST
    =============================== */
    req.vendor = {
      id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      active: vendor.active,
    };

    next();
  } catch (error) {
    console.error("🔥 Vendor Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
