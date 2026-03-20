const express = require("express");
const {
  createDescription,
  getDescriptions,
  updateDescription,
  deleteDescription
} = require("../controllers/descriptionController");

const router = express.Router();

router.post("/", createDescription);         // Create
router.get("/", getDescriptions);            // Read All
router.put("/:id", updateDescription);       // Update
router.delete("/:id", deleteDescription);    // Delete

module.exports = router;
