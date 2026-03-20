const router = require("express").Router();
const {
  setInventory,
  getInventory,
  lowStock
} = require("../controllers/inventoryController");

router.post("/set", setInventory);
router.get("/all", getInventory);
router.get("/low", lowStock);

module.exports = router;
