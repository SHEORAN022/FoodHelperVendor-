const express = require("express");
const router = express.Router();

const userAuth = require("../middleware/userAuth");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.use(userAuth);

router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
