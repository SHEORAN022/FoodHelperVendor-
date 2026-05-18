const express = require("express");
const AppSettings = require("../models/AppSettings");

const router = express.Router();

/* GET SETTINGS */
router.get("/settings", async (req, res) => {
  try {
    let settings = await AppSettings.findOne();

    // create default settings
    if (!settings) {
      settings = await AppSettings.create({});
    }

    res.json({
      success: true,
      settings,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* TOGGLE MAINTENANCE */
router.put("/settings/maintenance", async (req, res) => {
  try {
    const {
      maintenanceMode,
      maintenanceMessage,
    } = req.body;

    let settings = await AppSettings.findOne();

    if (!settings) {
      settings = await AppSettings.create({});
    }

    settings.maintenanceMode =
      maintenanceMode;

    if (maintenanceMessage) {
      settings.maintenanceMessage =
        maintenanceMessage;
    }

    await settings.save();

    res.json({
      success: true,
      message: "Maintenance mode updated",
      settings,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;