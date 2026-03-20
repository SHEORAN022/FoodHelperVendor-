// const express = require("express");
// const router = express.Router();
// const vendorAuth = require("../middleware/vendorAuth");
// const controller = require("../controllers/vendorProfile.controller");

// /* 🔐 PROTECTED */
// router.use(vendorAuth);

// /* 🔑 CHANGE PASSWORD */
// router.put("/change-password", controller.changePassword);

// module.exports = router;
const express = require("express");
const router = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const controller = require("../controllers/vendorProfile.controller");

router.use(vendorAuth);

router.get("/", controller.getProfile);
router.put("/", controller.updateProfile);
router.put("/change-password", controller.changePassword);

module.exports = router;
