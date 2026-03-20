const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/riderController");

router.get("/", ctrl.getRiders);
router.post("/", ctrl.createRider);
router.put("/:id", ctrl.updateRider);
router.delete("/:id", ctrl.deleteRider);

module.exports = router;
