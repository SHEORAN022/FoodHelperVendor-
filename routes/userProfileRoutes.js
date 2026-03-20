const express = require("express");
const multer = require("multer");
const userAuth = require("../middleware/userAuth");
const {
  getProfile,
  updateProfile,
} = require("../controllers/userProfileController");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(userAuth);

router.get("/profile", getProfile);
router.put("/profile", upload.single("image"), updateProfile);

module.exports = router;
