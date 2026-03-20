
const Price = require("../models/priceModel");
const cloudinary = require("../utils/cloudinary");
const Category = require("../models/categoryModel");
const csv = require("fast-csv");

/* ======================================================
      CLOUDINARY UPLOAD
====================================================== */
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "price_images" }, (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
};

/* ======================================================
      MIDNIGHT AUTO LOCK LOGIC
====================================================== */
async function runDailyLock() {
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  const items = await Price.find();

  for (const p of items) {
    if (p.lastLockDate === today) continue;

    const created = new Date(p.createdAt);
    const createdToday =
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate();

    if (createdToday) continue;

    const previousLock = p.lockedPrice || 0;
    const sale = p.salePrice || 0;

    p.yesterdayLock = previousLock;
    p.lockedPrice = sale;
    p.brokerDisplay = sale - previousLock;
    p.lastLockDate = today;

    await p.save();
  }

  console.log("🌙 Auto Lock Completed:", today);
}

/* ======================================================
      SAFE AUTO LOCK TRIGGER
====================================================== */
async function checkAutoLock() {
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  const one = await Price.findOne();

  if (one && one.lastLockDate !== today) {
    console.log("🔥 Auto-lock Triggered via API Access");
    await runDailyLock();
  }
}


exports.getPrices = async (req, res) => {
  try {
    await checkAutoLock();

    const prices = await Price.find()
      .populate("category", "name image")
      // .populate("subcategory", "name image");

    const result = {};

    prices.forEach((p) => {
      if (!p.category || !p.category._id) return;

      const catId = String(p.category._id);
      // const subId = p.subcategory?._id
      //   ? String(p.subcategory._id)
      //   : "NO_SUB";
       const subId = p.subcategory?.id
  ? String(p.subcategory.id)
  : "NO_SUB";

      // CATEGORY
      if (!result[catId]) {
        result[catId] = {
          id: p.category._id,
          name: p.category.name,
          image: p.category.image,
          subcategories: {},
        };
      }

      // SUBCATEGORY (NULL SAFE)
      if (!result[catId].subcategories[subId]) {
        result[catId].subcategories[subId] = {
          id: p.subcategory?.id || null,
          name: p.subcategory?.name || "Others",
          image: p.subcategory?.image || "",
          products: [],
        };
      }

      // PRODUCTS
      result[catId].subcategories[subId].products.push({
        _id: p._id,
        name: p.name,
          weight: p.weight || { value: 1, unit: "kg" }, 
        basePrice: p.basePrice,
        profitLoss: p.profitLoss,
          gstPercent: p.gstPercent || 0,
  hsnCode: p.hsnCode || "",
  taxType: p.taxType || "cgst_sgst",
        salePrice: p.salePrice,
        lockedPrice: p.lockedPrice,
        yesterdayLock: p.yesterdayLock,
        brokerDisplay: p.brokerDisplay,
        lastLockDate: p.lastLockDate,
        description: p.description,
        image: p.image,
        status: p.status,
        createdAt: p.createdAt,
      });
    });

    const data = Object.values(result).map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      subcategories: Object.values(cat.subcategories),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ getPrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getWebsitePrices = async (req, res) => {
  try {
    await checkAutoLock();

    const prices = await Price.find({
      status: "active",
      category: { $ne: null },
      subcategory: { $ne: null },
    })
      .populate("category", "name image")
      // .populate("subcategory", "name image");

    const result = {};

    prices.forEach((p) => {
      const category = p.category;
      const subcategory = p.subcategory;

      if (!category || !category._id) return;
      if (!subcategory || !subcategory.id) return;

      const catId = String(category._id);
      const subId = String(subcategory.id);

      // CATEGORY LEVEL
      if (!result[catId]) {
        result[catId] = {
          id: category._id,
          name: category.name,
          image: category.image,
          subcategories: {},
        };
      }

      // SUBCATEGORY LEVEL
      if (!result[catId].subcategories[subId]) {
        result[catId].subcategories[subId] = {
          id: subcategory.id,
          name: subcategory.name,
          image: subcategory.image,
          products: [],
        };
      }

      // PRODUCTS
      result[catId].subcategories[subId].products.push({
        _id: p._id,
        name: p.name,
          weight: p.weight || { value: 1, unit: "kg" }, 
        basePrice: p.basePrice,
        profitLoss: p.profitLoss,
          gstPercent: p.gstPercent || 0,
  hsnCode: p.hsnCode || "",
  taxType: p.taxType || "cgst_sgst",
        salePrice: p.salePrice,
        lockedPrice: p.lockedPrice,
        yesterdayLock: p.yesterdayLock,
        brokerDisplay: p.brokerDisplay,
        lastLockDate: p.lastLockDate,
        description: p.description,
        image: p.image,
        status: p.status,
        createdAt: p.createdAt,
      });
    });

    // FINAL ARRAY FORMAT
    const data = Object.values(result).map((cat) => ({
      id: cat.id,
      name: cat.name,
      image: cat.image,
      subcategories: Object.values(cat.subcategories),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ getWebsitePrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.createPrice = async (req, res) => {
  try {
    let img = "";
    if (req.file) img = await uploadToCloudinary(req.file.buffer);

    const base = Number(req.body.basePrice);
    const pl = Number(req.body.profitLoss || 0);
    const gst = Number(req.body.gstPercent || 0);

    /* ================= WEIGHT SAFE ================= */
    let weight = { value: 1, unit: "kg" };

    if (req.body.weight) {
      try {
        weight = JSON.parse(req.body.weight);
      } catch {
        console.log("❌ Invalid weight JSON:", req.body.weight);
      }
    }

    // 🔥 ENUM SAFETY (g → gm)
    if (weight.unit === "g") weight.unit = "gm";

    if (!["kg", "gm", "ltr", "ml", "pcs"].includes(weight.unit)) {
      weight.unit = "kg";
    }

    /* ================= SUBCATEGORY SAFE ================= */
    // let subcategory = null;
    // if (req.body.subcategory) {
    //   try {
    //     subcategory = JSON.parse(req.body.subcategory);
    //   } catch {
    //     console.log("❌ Invalid subcategory:", req.body.subcategory);
    //     subcategory = null;
    //   }
    // }
let subcategory = null;

if (req.body.subcategory) {
  try {
    const sub = JSON.parse(req.body.subcategory);

    subcategory = {
      id: sub.id,              // 🔥 MUST
      name: sub.name,
      image: sub.image || "",
    };
  } catch (e) {
    console.log("❌ Invalid Subcategory JSON", e.message);
  }
}



    /* ================= PRICE CALC ================= */
    const priceWithoutGst = base + pl;
    const gstAmount = (priceWithoutGst * gst) / 100;
    const sale = priceWithoutGst + gstAmount;

    /* ================= CREATE ================= */
    const created = await Price.create({
      name: req.body.name,
      category: req.body.category,
      subcategory,          // ✅ safe
      weight,               // ✅ safe
      basePrice: base,
      profitLoss: pl,
      salePrice: sale,
      gstPercent: gst,
      hsnCode: req.body.hsnCode || "",
      taxType: req.body.taxType || "cgst_sgst",
      lockedPrice: 0,
      yesterdayLock: 0,
      brokerDisplay: sale,
      lastLockDate: "",
      description: req.body.description || "",
      status: req.body.status || "inactive",
      image: img,
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.error("❌ CREATE ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.updatePrice = async (req, res) => {
  try {
    let item = await Price.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });

    // 📷 Image
    if (req.file) {
      item.image = await uploadToCloudinary(req.file.buffer);
    }

    // 📦 Category
    if (req.body.category) {
      item.category = req.body.category;
    }

    // 📁 Subcategory
    // if (req.body.subcategory) {
    //   try {
    //     item.subcategory = JSON.parse(req.body.subcategory);
    //   } catch {
    //     console.log("❌ Invalid Subcategory JSON");
    //   }
    // }
let subcategory = null;

if (req.body.subcategory) {
  try {
    const sub = JSON.parse(req.body.subcategory);

    subcategory = {
      id: sub.id,
      name: sub.name,
      image: sub.image || "",
    };

    item.subcategory = subcategory;   // 🔥 MUST LINE
  } catch (e) {
    console.log("❌ Invalid Subcategory JSON", e.message);
  }
}
if (req.body.subcategory === "") {
  item.subcategory = null;
}


    // ⚖️ Weight
if (req.body.weight) {
  try {
    if (typeof req.body.weight === "string") {
      item.weight = JSON.parse(req.body.weight);
    } else {
      item.weight = req.body.weight;
    }
  } catch (e) {
    console.log("❌ Invalid weight:", req.body.weight);
  }
}


    // 💰 Base Price
    if (req.body.basePrice !== undefined)
      item.basePrice = Number(req.body.basePrice);

    // 📈 Profit / Loss
    if (req.body.profitLoss !== undefined)
      item.profitLoss = Number(req.body.profitLoss);

    // 🧾 GST
    const gst = req.body.gstPercent !== undefined
      ? Number(req.body.gstPercent)
      : Number(item.gstPercent || 0);

    item.gstPercent = gst;
    item.hsnCode = req.body.hsnCode || item.hsnCode || "";
    item.taxType = req.body.taxType || item.taxType || "cgst_sgst";

    // 🧮 FINAL PRICE CALCULATION (WITH GST)
    const priceWithoutGst = Number(item.basePrice) + Number(item.profitLoss || 0);
    const gstAmount = (priceWithoutGst * gst) / 100;

    item.salePrice = priceWithoutGst + gstAmount;
    item.brokerDisplay = item.salePrice - item.lockedPrice;

    // 📝 Other fields
    if (req.body.name) item.name = req.body.name;
    if (req.body.description) item.description = req.body.description;
    if (req.body.status) item.status = req.body.status;

    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.updateDiff = async (req, res) => {
  try {
    const item = await Price.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false });

    const diff = Number(req.body.diff);
    item.profitLoss = diff;

    // 🧮 Recalculate with GST
    const priceWithoutGst = Number(item.basePrice) + diff;
    const gst = Number(item.gstPercent || 0);
    const gstAmount = (priceWithoutGst * gst) / 100;

    item.salePrice = priceWithoutGst + gstAmount;
    item.brokerDisplay = item.salePrice - item.lockedPrice;

    await item.save();

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("❌ updateDiff error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      STATUS UPDATE
====================================================== */
exports.updateStatus = async (req, res) => {
  try {
    const updated = await Price.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      DELETE PRODUCT
====================================================== */
exports.deletePrice = async (req, res) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      DELETE SELECTED
====================================================== */
exports.deleteSelected = async (req, res) => {
  try {
    await Price.deleteMany({ _id: { $in: req.body.ids } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      COPY PRODUCT
====================================================== */
exports.copyPrice = async (req, res) => {
  try {
    const item = await Price.findById(req.params.id);

    const newItem = await Price.create({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      weight: item.weight,
      basePrice: item.basePrice,
      profitLoss: item.profitLoss,
      salePrice: item.salePrice,
      lockedPrice: 0,
      yesterdayLock: 0,
      brokerDisplay: 0,
      lastLockDate: "",
      description: item.description,
      status: item.status,
      image: item.image,
    });

    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.bulkUpdatePrices = async (req, res) => {
  try {
    const updated = [];

    for (const p of req.body.products) {
      const item = await Price.findById(p.id);
      if (!item) continue;

     

      if (p.basePrice !== undefined) item.basePrice = Number(p.basePrice);
if (p.profitLoss !== undefined) item.profitLoss = Number(p.profitLoss);
if (p.gstPercent !== undefined) item.gstPercent = Number(p.gstPercent);

const priceWithoutGst = Number(item.basePrice) + Number(item.profitLoss || 0);
const gst = Number(item.gstPercent || 0);
const gstAmount = (priceWithoutGst * gst) / 100;

item.salePrice = priceWithoutGst + gstAmount;
item.brokerDisplay = item.salePrice - item.lockedPrice;

      if (p.status) item.status = p.status;

      await item.save();
      updated.push(item);
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ bulkUpdatePrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.importPrices = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file required" });
    }

    const rows = [];
    const file = req.file.buffer.toString("utf-8");

    csv
      .parseString(file, { headers: true })
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        let success = 0;

        for (const r of rows) {
          try {
            const base = Number(r.basePrice || 0);
            const pl = Number(r.profitLoss || 0);
            const gst = Number(r.gstPercent || 0);

            const priceWithoutGst = base + pl;
            const gstAmount = (priceWithoutGst * gst) / 100;
            const sale = priceWithoutGst + gstAmount;

            /* ================= WEIGHT ================= */
            let weight = { value: 1, unit: "kg" };
            if (r.weight) {
              try {
                weight = JSON.parse(r.weight);
              } catch {
                console.log("⚠️ Invalid weight:", r.weight, "for", r.name);
              }
            }
            if (weight.unit === "g") weight.unit = "gm";

            /* ================= CATEGORY ================= */
            let categoryId = null;
            if (r.category) {
              const cat = await Category.findOne({ name: r.category.trim() });
              if (!cat) {
                console.log("❌ Category not found:", r.category);
                continue;
              }
              categoryId = cat._id;
            }

            /* ================= SUBCATEGORY ================= */
            // let subcategory = null;
            // if (r.subcategory) {
            //   try {
            //     subcategory = JSON.parse(r.subcategory);
            //   } catch {
            //     subcategory = null;
            //   }
            // }
            let subcategory = null;

if (r.subcategory && r.category) {
  const cat = await Category.findOne({ name: r.category.trim() });

  if (cat) {
    const sub = cat.subcategories.find(
      s => s.name.toLowerCase() === r.subcategory.trim().toLowerCase()
    );

    if (sub) {
      subcategory = {
        id: sub._id.toString(),
        name: sub.name,
        image: sub.image || "",
      };
    }
  }
}


            /* ================= IMAGE ================= */
            let image = "";
            if (r.image && r.image.startsWith("http")) {
              image = r.image.trim();
            }

            await Price.create({
              name: r.name,
              category: categoryId,
              subcategory,
              weight,
              basePrice: base,
              profitLoss: pl,
              salePrice: sale,
              gstPercent: gst,
              hsnCode: r.hsnCode || "",
              taxType: r.taxType || "cgst_sgst",
              lockedPrice: 0,
              yesterdayLock: 0,
              brokerDisplay: sale,
              lastLockDate: "",
              description: r.description || "",
              status: r.status || "inactive",
              image,           // 🔥 IMAGE NOW SAVED
            });

            success++;
          } catch (e) {
            console.log("❌ Row skipped:", r.name, e.message);
          }
        }

        res.json({ success: true, imported: success });
      });
  } catch (err) {
    console.error("❌ importPrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.exportPrices = async (req, res) => {
  try {
    const data = await Price.find().populate("category", "name");

    res.setHeader("Content-Disposition", "attachment; filename=prices.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);

    data.forEach((p) => {
      csvStream.write({
        id: p._id,
        name: p.name,
        category: p.category?.name || "",
        basePrice: p.basePrice,
        profitLoss: p.profitLoss,

        // 🔥 IMAGE MUST BE HERE
        image: p.image || "",

        // 🔥 WEIGHT
        weight: JSON.stringify(p.weight),

        // 🧾 GST
        gstPercent: p.gstPercent || 0,
        hsnCode: p.hsnCode || "",
        taxType: p.taxType || "cgst_sgst",

        salePrice: p.salePrice,
        lockedPrice: p.lockedPrice,
        yesterdayLock: p.yesterdayLock,
        brokerDisplay: p.brokerDisplay,
        status: p.status,
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("❌ exportPrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.exportSelected = async (req, res) => {
//   try {
//     const ids = req.body.ids || [];
//     const data = await Price.find({ _id: { $in: ids } }).populate("category", "name");

//     res.setHeader("Content-Disposition", "attachment; filename=selected_prices.csv");
//     res.setHeader("Content-Type", "text/csv");

//     const csvStream = csv.format({ headers: true });
//     csvStream.pipe(res);

//     data.forEach((p) => {
//       csvStream.write({
//         id: p._id,
//         name: p.name,
//         category: p.category?.name || "",
//           weight: JSON.stringify(p.weight), 
//         basePrice: p.basePrice,
//         profitLoss: p.profitLoss,
//          gstPercent: p.gstPercent || 0,
//         hsnCode: p.hsnCode || "",
//         taxType: p.taxType || "cgst_sgst",
//         salePrice: p.salePrice,
//         lockedPrice: p.lockedPrice,
//         yesterdayLock: p.yesterdayLock,
//         brokerDisplay: p.brokerDisplay,
//         status: p.status,
//       });
//     });

//     csvStream.end();
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.exportSelected = async (req, res) => {
  try {
    const ids = req.body.ids || [];
    const data = await Price.find({ _id: { $in: ids } }).populate("category", "name");

    res.setHeader("Content-Disposition", "attachment; filename=selected_prices.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);

    data.forEach((p) => {
      csvStream.write({
        id: p._id,
        name: p.name,
        category: p.category?.name || "",

        // 🔥 IMAGE MUST BE EXPORTED
        image: p.image || "",

        // 🔥 WEIGHT
        weight: JSON.stringify(p.weight),

        basePrice: p.basePrice,
        profitLoss: p.profitLoss,

        // 🧾 GST
        gstPercent: p.gstPercent || 0,
        hsnCode: p.hsnCode || "",
        taxType: p.taxType || "cgst_sgst",

        salePrice: p.salePrice,
        lockedPrice: p.lockedPrice,
        yesterdayLock: p.yesterdayLock,
        brokerDisplay: p.brokerDisplay,
        status: p.status,
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("❌ exportSelected error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      SET GST FOR PRODUCT
====================================================== */
exports.setGST = async (req, res) => {
  try {
    const { productId, gstPercent, hsnCode, taxType } = req.body;

    const price = await Price.findById(productId);
    if (!price) return res.status(404).json({ success: false });

    price.gstPercent = Number(gstPercent);
    price.hsnCode = hsnCode;
    price.taxType = taxType;

    await price.save();
    res.json({ success: true, data: price });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      GET GST LIST
====================================================== */
exports.getGSTList = async (req, res) => {
  try {
    const data = await Price.find().select("name gstPercent hsnCode taxType");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
      ADD DISCOUNT
====================================================== */
exports.addDiscount = async (req, res) => {
  try {
    const { product, minQty, maxQty, discountPercent } = req.body;

    const price = await Price.findById(product);
    if (!price) return res.status(404).json({ success: false });

    price.discounts.push({
      minQty: Number(minQty),
      maxQty: Number(maxQty),
      discountPercent: Number(discountPercent),
    });

    await price.save();
    res.json({ success: true, data: price });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      GET DISCOUNT LIST
====================================================== */
exports.getDiscountList = async (req, res) => {
  try {
    const prices = await Price.find().select("name discounts");

    const list = [];
    prices.forEach(p => {
      p.discounts.forEach(d => {
        list.push({
          _id: d._id,
          product: { name: p.name },
          minQty: d.minQty,
          maxQty: d.maxQty,
          discountPercent: d.discountPercent,
        });
      });
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
