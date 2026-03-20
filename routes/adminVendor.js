const express = require("express");
const Vendor = require("../models/Vendor");

const router = express.Router();

/* GET ALL VENDORS */
router.get("/vendors", async (req, res) => {
  const vendors = await Vendor.find();
  res.json(vendors);
});

/* UPDATE STATUS */
router.put("/vendor/:id", async (req, res) => {
  const { status } = req.body;

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json({ message: "Status updated", vendor });
});

module.exports = router;
