const express = require("express");
const multer = require("multer");
const {
  createReport,
  getReports,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), createReport);
router.get("/", getReports);
router.delete("/:id", deleteReport);

module.exports = router;
