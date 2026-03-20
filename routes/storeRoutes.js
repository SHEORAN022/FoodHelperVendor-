const express = require("express");
const router = express.Router();
const {
  createStore,
  getStores,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");

router.get("/", getStores);
router.post("/", createStore);
router.put("/:id", updateStore);
router.delete("/:id", deleteStore);

module.exports = router;
