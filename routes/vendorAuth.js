const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

const router = express.Router();

/* =====================
   VENDOR SIGNUP
===================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await Vendor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Vendor.create({
      name,
      email,
      password: hashedPassword,
      phone,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Signup successful. Waiting for admin approval",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================
   VENDOR LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        message: "Vendor not approved by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
