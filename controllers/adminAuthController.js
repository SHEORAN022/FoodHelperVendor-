// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Admin = require("../models/Admin");

// exports.adminRegister = async (req, res) => {
//   try {
//     const { email, password, name } = req.body;
//     const existing = await Admin.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Admin already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const admin = new Admin({ name, email, password: hashed });
//     await admin.save();

//     res.status(201).json({ message: "Admin registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(400).json({ message: "Admin not found" });

//     const match = await bcrypt.compare(password, admin.password);
//     if (!match) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
//     res.status(200).json({ message: "Login successful as admin", token, role: "admin" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.adminRegister = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashed });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful as admin",
      token,
      role: "admin",
      name: admin.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.adminId);
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match)
      return res.status(400).json({ message: "Old password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
