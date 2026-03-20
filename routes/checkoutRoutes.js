const router = require("express").Router();
const { checkout } = require("../controllers/checkoutController");

router.post("/checkout", checkout);
module.exports = router;
