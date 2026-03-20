const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

/* ================================
   APP INIT
================================ */
const app = express();

/* ================================
   BODY PARSER
================================ */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================================
   CORS – PRODUCTION SAFE
================================ */
const allowedOrigins = [
  "http://localhost:3000",
  "https://palegoldenrod-toad-265062.hostingersite.com",
  "https://sg-overseas.vercel.app",
  "http://localhost:3001",
   "https://food-helper-seller.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, curl

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ CORS blocked: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle Preflight (VERY IMPORTANT)
app.options("*", cors());

/* ================================
   UPLOADS FOLDER
================================ */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 uploads folder created");
}
app.use("/uploads", express.static(uploadDir));

/* ================================
   ROUTES
================================ */
app.use("/api/admin", require("./routes/adminAuthRoutes"));
app.use("/api/user", require("./routes/userAuthRoutes"));
app.use("/api/prices", require("./routes/priceRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/price-report", require("./routes/priceReportRoutes"));
app.use("/api/descriptions", require("./routes/descriptionRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/gst", require("./routes/gstRoutes"));
app.use("/api/discount", require("./routes/discountRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/stores", require("./routes/storeRoutes"));
app.use("/api/riders", require("./routes/riderRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/vendor", require("./routes/vendorAuth"));
app.use("/api/admin", require("./routes/adminVendor"));
app.use("/api/vendor/categories", require("./routes/vendorCategoryRoutes"));
app.use("/api/user", require("./routes/userProfileRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/vendor/products", require("./routes/vendorProduct.routes"));
app.use("/api/admin", require("./routes/adminCategoryRoutes"));
app.use(
  "/api/vendor/orders",
  require("./routes/vendorOrder.routes")
);
app.use("/api/vendor/profile", require("./routes/vendorProfile.routes"));
app.use("/api/vendor/inventory", require("./routes/vendorInventory.routes"));
app.use("/api/vendor/bulk-discounts", require("./routes/vendorBulkDiscountRoutes"));
/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("🚀 Grocery Backend Running Successfully");
});

/* ================================
   404 HANDLER
================================ */
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

/* ================================
   CONNECT DATABASE & START SERVER
================================ */
const PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
