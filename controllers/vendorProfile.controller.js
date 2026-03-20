// const Vendor = require("../models/Vendor");
// const bcrypt = require("bcryptjs");

// /* ======================================================
//    CHANGE PASSWORD (VENDOR)
// ====================================================== */
// exports.changePassword = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     const { oldPassword, newPassword, confirmPassword } = req.body;

//     if (!oldPassword || !newPassword || !confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "New password and confirm password do not match",
//       });
//     }

//     const vendor = await Vendor.findById(vendorId);
//     if (!vendor) {
//       return res.status(404).json({
//         success: false,
//         message: "Vendor not found",
//       });
//     }

//     /* 🔑 CHECK OLD PASSWORD */
//     const isMatch = await bcrypt.compare(oldPassword, vendor.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Old password is incorrect",
//       });
//     }

//     /* 🔐 HASH NEW PASSWORD */
//     const salt = await bcrypt.genSalt(10);
//     vendor.password = await bcrypt.hash(newPassword, salt);
//     await vendor.save();

//     res.json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (err) {
//     console.error("❌ changePassword error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");

/* ======================================================
   GET VENDOR PROFILE
====================================================== */
exports.getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor.id).select("-password");
    res.json({ success: true, data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   UPDATE VENDOR PROFILE
====================================================== */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const vendor = await Vendor.findById(req.vendor.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (name !== undefined) vendor.name = name;
    if (phone !== undefined) vendor.phone = phone;

    await vendor.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   CHANGE PASSWORD
====================================================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const vendor = await Vendor.findById(req.vendor.id);

    const isMatch = await bcrypt.compare(oldPassword, vendor.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(newPassword, salt);
    await vendor.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
