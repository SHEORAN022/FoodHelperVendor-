// const express = require("express");
// const router = express.Router();
// const Setting = require("../models/Setting");

// // Get Current Status
// router.get("/", async (req, res) => {
//   let setting = await Setting.findOne();
//   if (!setting) setting = await Setting.create({ websiteActive: true });

//   res.json(setting);
// });

// // Toggle Status
// router.put("/toggle", async (req, res) => {
//   let setting = await Setting.findOne();
//   if (!setting) setting = await Setting.create({ websiteActive: true });

//   setting.websiteActive = !setting.websiteActive;
//   await setting.save();

//   res.json({ success: true, websiteActive: setting.websiteActive });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
// const { protect, admin } = require("../middleware/authMiddleware"); // optional

/* =====================================================
   GET CURRENT WEBSITE STATUS
===================================================== */
router.get("/", async (req, res) => {
  try {
    let setting = await Setting.findOne();

    // ✅ SAFE DEFAULT: OFF
    if (!setting) {
      setting = await Setting.create({
        websiteActive: false,
      });
    }

    res.json({
      success: true,
      websiteActive: setting.websiteActive,
    });
  } catch (err) {
    console.error("Settings GET error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch website settings",
    });
  }
});

/* =====================================================
   TOGGLE WEBSITE STATUS (ADMIN ONLY RECOMMENDED)
===================================================== */
router.put(
  "/toggle",
  // protect, admin, // 👈 production me enable karo
  async (req, res) => {
    try {
      let setting = await Setting.findOne();

      if (!setting) {
        setting = await Setting.create({
          websiteActive: false,
        });
      }

      setting.websiteActive = !setting.websiteActive;
      await setting.save();

      res.json({
        success: true,
        websiteActive: setting.websiteActive,
        message: setting.websiteActive
          ? "Website is now LIVE"
          : "Website is now under MAINTENANCE",
      });
    } catch (err) {
      console.error("Settings TOGGLE error:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to toggle website status",
      });
    }
  }
);

module.exports = router;
