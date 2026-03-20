// const express = require("express");
// const router = express.Router();
// const { adminRegister, adminLogin } = require("../controllers/adminAuthController");

// router.post("/register", adminRegister);
// router.post("/login", adminLogin);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  adminRegister,
  adminLogin,
  updateAdminPassword,
} = require("../controllers/adminAuthController");

const verifyAdmin = require("../middleware/verifyAdmin");

// ✅ REGISTER
router.post("/register", adminRegister);

// ✅ LOGIN
router.post("/login", adminLogin);

// ✅ UPDATE PASSWORD
router.put("/update-password", verifyAdmin, updateAdminPassword);

module.exports = router;
