// const VendorProduct  = require("../models/vendorProduct");
// const VendorCategory = require("../models/VendorCategory");
// const cloudinary     = require("../utils/cloudinary");
// const csv            = require("fast-csv");

// /* ─── Upload Helper ─── */
// const uploadToCloudinary = (buffer) =>
//   new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder: "vendor_products" }, (err, result) => {
//         if (err) reject(err);
//         else resolve(result.secure_url);
//       })
//       .end(buffer);
//   });

// /* ─── Parse helpers ─── */
// const parseJSON = (str, fallback = null) => {
//   try { return JSON.parse(str); } catch { return fallback; }
// };

// /* ================================================================
//    CREATE PRODUCT
//    ================================================================ */
// exports.createProduct = async (req, res) => {
//   try {
//     const {
//       name, category, description, basePrice, salePrice,
//       status, weight, subcategory, subSubCategory,
//     } = req.body;

//     /* Category must exist */
//     const categoryDoc = await VendorCategory.findById(category);
//     if (!categoryDoc)
//       return res.status(400).json({ success: false, message: "Invalid category" });

//     /* Image */
//     let image = "";
//     if (req.file) image = await uploadToCloudinary(req.file.buffer);

//     /* Weight */
//     let parsedWeight = { value: 1, unit: "kg" };
//     if (weight) {
//       parsedWeight = parseJSON(weight, parsedWeight);
//       if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
//     }

//     /* Prices */
//     const base = Number(basePrice);
//     const sale = Number(salePrice || base);
//     if (isNaN(base) || isNaN(sale))
//       return res.status(400).json({ success: false, message: "Invalid price" });

//     /* subcategory & subSubCategory */
//     const subCat    = subcategory    ? parseJSON(subcategory)    : null;
//     const subSubCat = subSubCategory ? parseJSON(subSubCategory) : null;

//     const product = await VendorProduct.create({
//       vendor:        req.vendor.id,
//       name,
//       category:      categoryDoc._id,
//       subcategory:   subCat    || { id: null, name: null, image: null },
//       subSubCategory: subSubCat || { id: null, name: null, image: null },
//       weight:        parsedWeight,
//       image,
//       description:   description || "",
//       basePrice:     base,
//       salePrice:     sale,
//       discount:      base > sale ? base - sale : 0,
//       status:        status || "inactive",
//     });

//     res.status(201).json({ success: true, data: product });
//   } catch (err) {
//     console.error("createProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    GET MY PRODUCTS (flat list)
//    ================================================================ */
// exports.getMyProducts = async (req, res) => {
//   try {
//     const products = await VendorProduct.find({ vendor: req.vendor.id })
//       .populate("category", "name image subcategories")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, data: products });
//   } catch (err) {
//     console.error("getMyProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    GET PRODUCTS TREE (Category > Sub > SubSub > Products)
//    ================================================================ */
// exports.getVendorProductsTree = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
//     const products   = await VendorProduct.find({ vendor: vendorId }).lean();

//     const data = categories.map((cat) => {
//       const subcategories = (cat.subcategories || [])
//         .filter(s => s.active)
//         .map((sub) => {
//           const subSubCategories = (sub.subSubCategories || [])
//             .filter(ss => ss.active)
//             .map((ss) => {
//               const ssProducts = products.filter(
//                 (p) =>
//                   String(p.category) === String(cat._id) &&
//                   p.subcategory?.id  === String(sub._id) &&
//                   p.subSubCategory?.id === String(ss._id)
//               );
//               return { _id: ss._id, name: ss.name, image: ss.image, products: ssProducts };
//             });

//           /* Direct sub products (no subSubCategory) */
//           const directProducts = products.filter(
//             (p) =>
//               String(p.category) === String(cat._id) &&
//               p.subcategory?.id  === String(sub._id) &&
//               !p.subSubCategory?.id
//           );

//           return { _id: sub._id, name: sub.name, image: sub.image, subSubCategories, products: directProducts };
//         });

//       return { _id: cat._id, name: cat.name, image: cat.image, subcategories };
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("getVendorProductsTree error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    UPDATE PRODUCT
//    ================================================================ */
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
//     if (!product)
//       return res.status(404).json({ success: false, message: "Product not found" });

//     const {
//       name, description, status, category,
//       weight, subcategory, subSubCategory, basePrice, salePrice,
//     } = req.body;

//     if (req.file)        product.image       = await uploadToCloudinary(req.file.buffer);
//     if (name)            product.name        = name;
//     if (description !== undefined) product.description = description;
//     if (status)          product.status      = status;
//     if (category)        product.category    = category;

//     if (subcategory !== undefined) {
//       product.subcategory = subcategory ? parseJSON(subcategory) : { id: null, name: null, image: null };
//     }
//     if (subSubCategory !== undefined) {
//       product.subSubCategory = subSubCategory ? parseJSON(subSubCategory) : { id: null, name: null, image: null };
//     }

//     if (weight) {
//       const w = parseJSON(weight);
//       if (w) { if (w.unit === "g") w.unit = "gm"; product.weight = w; }
//     }

//     if (basePrice !== undefined) product.basePrice = Number(basePrice);
//     if (salePrice !== undefined) product.salePrice = Number(salePrice);
//     product.discount = product.basePrice > product.salePrice ? product.basePrice - product.salePrice : 0;

//     await product.save();
//     res.json({ success: true, data: product });
//   } catch (err) {
//     console.error("updateProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    DELETE PRODUCT
//    ================================================================ */
// exports.deleteProduct = async (req, res) => {
//   try {
//     const deleted = await VendorProduct.deleteOne({ _id: req.params.id, vendor: req.vendor.id });
//     if (!deleted.deletedCount)
//       return res.status(404).json({ success: false, message: "Product not found" });

//     res.json({ success: true, message: "Product deleted" });
//   } catch (err) {
//     console.error("deleteProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    STATUS UPDATE
//    ================================================================ */
// exports.updateStatus = async (req, res) => {
//   try {
//     const updated = await VendorProduct.findOneAndUpdate(
//       { _id: req.params.id, vendor: req.vendor.id },
//       { status: req.body.status },
//       { new: true }
//     );
//     if (!updated)
//       return res.status(404).json({ success: false, message: "Product not found" });

//     res.json({ success: true, data: updated });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    COPY PRODUCT
//    ================================================================ */
// exports.copyProduct = async (req, res) => {
//   try {
//     const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
//     if (!item)
//       return res.status(404).json({ success: false, message: "Product not found" });

//     const newItem = await VendorProduct.create({
//       vendor:        req.vendor.id,
//       name:          item.name + " (Copy)",
//       category:      item.category,
//       subcategory:   item.subcategory,
//       subSubCategory: item.subSubCategory,
//       weight:        item.weight,
//       image:         item.image,
//       description:   item.description,
//       basePrice:     item.basePrice,
//       salePrice:     item.salePrice,
//       discount:      item.discount,
//       status:        "inactive",
//     });

//     res.json({ success: true, data: newItem });
//   } catch (err) {
//     console.error("copyProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    BULK UPDATE
//    ================================================================ */
// exports.bulkUpdateProducts = async (req, res) => {
//   try {
//     const updated = [];
//     for (const p of req.body.products) {
//       const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
//       if (!item) continue;
//       if (p.basePrice !== undefined) item.basePrice = Number(p.basePrice);
//       if (p.salePrice !== undefined) item.salePrice = Number(p.salePrice);
//       if (p.status)                  item.status    = p.status;
//       item.discount = item.basePrice > item.salePrice ? item.basePrice - item.salePrice : 0;
//       await item.save();
//       updated.push(item);
//     }
//     res.json({ success: true, updated });
//   } catch (err) {
//     console.error("bulkUpdateProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    BULK DELETE
//    ================================================================ */
// exports.deleteSelected = async (req, res) => {
//   try {
//     await VendorProduct.deleteMany({ _id: { $in: req.body.ids }, vendor: req.vendor.id });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    EXPORT CSV (all)
//    ================================================================ */
// exports.exportProducts = async (req, res) => {
//   try {
//     const data = await VendorProduct.find({ vendor: req.vendor.id }).populate("category", "name");

//     res.setHeader("Content-Disposition", "attachment; filename=vendor_products.csv");
//     res.setHeader("Content-Type", "text/csv");

//     const csvStream = csv.format({ headers: true });
//     csvStream.pipe(res);

//     data.forEach((p) => {
//       csvStream.write({
//         id:             p._id,
//         name:           p.name,
//         category:       p.category?.name || "",
//         subcategory:    p.subcategory?.name || "",
//         subSubCategory: p.subSubCategory?.name || "",
//         image:          p.image || "",
//         weight:         JSON.stringify(p.weight),
//         description:    p.description || "",
//         basePrice:      p.basePrice,
//         salePrice:      p.salePrice,
//         discount:       p.discount,
//         status:         p.status,
//       });
//     });

//     csvStream.end();
//   } catch (err) {
//     console.error("exportProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    EXPORT SELECTED CSV
//    ================================================================ */
// exports.exportSelected = async (req, res) => {
//   try {
//     const data = await VendorProduct.find({
//       _id: { $in: req.body.ids || [] },
//       vendor: req.vendor.id,
//     }).populate("category", "name");

//     res.setHeader("Content-Disposition", "attachment; filename=selected_products.csv");
//     res.setHeader("Content-Type", "text/csv");

//     const csvStream = csv.format({ headers: true });
//     csvStream.pipe(res);

//     data.forEach((p) => {
//       csvStream.write({
//         id:             p._id,
//         name:           p.name,
//         category:       p.category?.name || "",
//         subcategory:    p.subcategory?.name || "",
//         subSubCategory: p.subSubCategory?.name || "",
//         image:          p.image || "",
//         weight:         JSON.stringify(p.weight),
//         description:    p.description || "",
//         basePrice:      p.basePrice,
//         salePrice:      p.salePrice,
//         discount:       p.discount,
//         status:         p.status,
//       });
//     });

//     csvStream.end();
//   } catch (err) {
//     console.error("exportSelected error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ================================================================
//    IMPORT CSV
//    ================================================================ */
// exports.importProducts = async (req, res) => {
//   try {
//     if (!req.file)
//       return res.status(400).json({ success: false, message: "CSV file required" });

//     const rows = [];
//     const fileStr = req.file.buffer.toString("utf-8");

//     await new Promise((resolve, reject) => {
//       csv.parseString(fileStr, { headers: true })
//         .on("data", (row) => rows.push(row))
//         .on("end",  resolve)
//         .on("error", reject);
//     });

//     let imported = 0;

//     for (const r of rows) {
//       try {
//         const base = Number(r.basePrice || 0);
//         const sale = Number(r.salePrice || base);

//         /* Weight */
//         let weight = { value: 1, unit: "kg" };
//         if (r.weight) { try { weight = JSON.parse(r.weight); } catch {} }
//         if (weight.unit === "g") weight.unit = "gm";

//         /* Category */
//         const cat = await VendorCategory.findOne({ name: r.category?.trim() });
//         if (!cat) { console.log("Category not found:", r.category); continue; }

//         /* Subcategory */
//         let subCat = { id: null, name: null, image: null };
//         if (r.subcategory) {
//           const sub = cat.subcategories?.find(s => s.name.toLowerCase() === r.subcategory.trim().toLowerCase());
//           if (sub) subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
//         }

//         /* Sub-Subcategory */
//         let subSubCat = { id: null, name: null, image: null };
//         if (r.subSubCategory && subCat.id) {
//           const sub = cat.subcategories?.find(s => s._id.toString() === subCat.id);
//           const ss  = sub?.subSubCategories?.find(x => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase());
//           if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
//         }

//         /* Image */
//         let image = "";
//         if (r.image?.startsWith("http")) image = r.image.trim();

//         await VendorProduct.create({
//           vendor:        req.vendor.id,
//           name:          r.name,
//           category:      cat._id,
//           subcategory:   subCat,
//           subSubCategory: subSubCat,
//           weight,
//           image,
//           description:   r.description || "",
//           basePrice:     base,
//           salePrice:     sale,
//           discount:      base > sale ? base - sale : 0,
//           status:        r.status || "inactive",
//         });

//         imported++;
//       } catch (e) {
//         console.log("Row skipped:", r.name, e.message);
//       }
//     }

//     res.json({ success: true, imported });
//   } catch (err) {
//     console.error("importProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


const VendorProduct  = require("../models/vendorProduct");
const VendorCategory = require("../models/VendorCategory");
const cloudinary     = require("../utils/cloudinary");
const csv            = require("fast-csv");

/* ══════════════════════════════════════════════════════════════
   HSN MASTER DATA  (same as admin)
══════════════════════════════════════════════════════════════ */
const HSN_CODES = [
  { code: "0401", description: "Milk & Cream (not concentrated, no added sugar)", gst: 0,  category: "Dairy & Eggs" },
  { code: "0402", description: "Milk & Cream (concentrated or with added sugar)",  gst: 5,  category: "Dairy & Eggs" },
  { code: "0403", description: "Buttermilk, Curd, Yoghurt, Kefir",                gst: 5,  category: "Dairy & Eggs" },
  { code: "0404", description: "Whey & Products of Natural Milk Constituents",     gst: 5,  category: "Dairy & Eggs" },
  { code: "0405", description: "Butter & Other Fats / Oils Derived from Milk",    gst: 12, category: "Dairy & Eggs" },
  { code: "0406", description: "Cheese & Curd",                                   gst: 12, category: "Dairy & Eggs" },
  { code: "0407", description: "Birds' Eggs in Shell — Fresh or Preserved",       gst: 0,  category: "Dairy & Eggs" },
  { code: "0408", description: "Birds' Eggs (not in shell) & Egg Yolks",          gst: 5,  category: "Dairy & Eggs" },
  { code: "0201", description: "Meat of Bovine Animals (fresh or chilled)",       gst: 0,  category: "Meat & Poultry" },
  { code: "0202", description: "Meat of Bovine Animals (frozen)",                 gst: 0,  category: "Meat & Poultry" },
  { code: "0207", description: "Meat & Edible Offal of Poultry",                  gst: 0,  category: "Meat & Poultry" },
  { code: "0210", description: "Meat & Offal (salted, dried or smoked)",          gst: 12, category: "Meat & Poultry" },
  { code: "0302", description: "Fish — Fresh or Chilled (excluding fillets)",     gst: 0,  category: "Fish & Seafood" },
  { code: "0303", description: "Fish (frozen, excluding fillets)",                 gst: 0,  category: "Fish & Seafood" },
  { code: "0304", description: "Fish Fillets & Other Fish Meat",                  gst: 5,  category: "Fish & Seafood" },
  { code: "0306", description: "Crustaceans — Prawns, Shrimps, Crabs, Lobsters", gst: 5,  category: "Fish & Seafood" },
  { code: "0701", description: "Potatoes (fresh or chilled)",                     gst: 0,  category: "Vegetables" },
  { code: "0702", description: "Tomatoes (fresh or chilled)",                     gst: 0,  category: "Vegetables" },
  { code: "0703", description: "Onions, Shallots, Garlic, Leeks",                 gst: 0,  category: "Vegetables" },
  { code: "0704", description: "Cabbages, Cauliflowers, Kohlrabi, Kale",          gst: 0,  category: "Vegetables" },
  { code: "0706", description: "Carrots, Turnips, Beetroot, Radishes",            gst: 0,  category: "Vegetables" },
  { code: "0707", description: "Cucumbers & Gherkins (fresh or chilled)",         gst: 0,  category: "Vegetables" },
  { code: "0709", description: "Other Vegetables (fresh or chilled)",             gst: 0,  category: "Vegetables" },
  { code: "0710", description: "Vegetables — Frozen",                             gst: 5,  category: "Vegetables" },
  { code: "0711", description: "Vegetables (provisionally preserved)",            gst: 5,  category: "Vegetables" },
  { code: "0801", description: "Coconuts, Brazil Nuts, Cashew Nuts",              gst: 0,  category: "Fruits & Nuts" },
  { code: "0802", description: "Almonds, Walnuts, Hazelnuts, Pistachios",         gst: 5,  category: "Fruits & Nuts" },
  { code: "0803", description: "Bananas (fresh or dried)",                        gst: 0,  category: "Fruits & Nuts" },
  { code: "0804", description: "Dates, Figs, Pineapples, Avocados, Mangoes",      gst: 0,  category: "Fruits & Nuts" },
  { code: "0805", description: "Citrus Fruits — Oranges, Lemons, Limes",         gst: 0,  category: "Fruits & Nuts" },
  { code: "0806", description: "Grapes (fresh or dried)",                         gst: 0,  category: "Fruits & Nuts" },
  { code: "0807", description: "Melons, Watermelons & Papayas",                   gst: 0,  category: "Fruits & Nuts" },
  { code: "0808", description: "Apples, Pears, Quinces",                          gst: 0,  category: "Fruits & Nuts" },
  { code: "0809", description: "Apricots, Cherries, Peaches, Plums",              gst: 0,  category: "Fruits & Nuts" },
  { code: "0810", description: "Strawberries, Raspberries, Kiwis & Other Fruits", gst: 0,  category: "Fruits & Nuts" },
  { code: "1001", description: "Wheat & Meslin",                                  gst: 0,  category: "Cereals & Grains" },
  { code: "1003", description: "Barley",                                           gst: 0,  category: "Cereals & Grains" },
  { code: "1006", description: "Rice",                                             gst: 0,  category: "Cereals & Grains" },
  { code: "1008", description: "Buckwheat, Millet, Canary Seeds, Other Cereals",  gst: 0,  category: "Cereals & Grains" },
  { code: "1101", description: "Wheat or Meslin Flour (Maida, Atta)",             gst: 0,  category: "Flour & Milling" },
  { code: "1102", description: "Cereal Flours — Corn, Rice (other than wheat)",   gst: 0,  category: "Flour & Milling" },
  { code: "1105", description: "Flour, Meal, Powder & Flakes of Potato",          gst: 5,  category: "Flour & Milling" },
  { code: "1108", description: "Starches — Wheat, Corn, Potato, Tapioca",         gst: 12, category: "Flour & Milling" },
  { code: "0713", description: "Dried Leguminous Vegetables — Dal, Lentils, Peas",gst: 0,  category: "Pulses & Legumes" },
  { code: "1106", description: "Flour & Meal of Dried Leguminous Vegetables",     gst: 0,  category: "Pulses & Legumes" },
  { code: "1507", description: "Soya-bean Oil & Its Fractions",                   gst: 5,  category: "Oils & Fats" },
  { code: "1511", description: "Palm Oil & Its Fractions",                         gst: 5,  category: "Oils & Fats" },
  { code: "1512", description: "Sunflower-seed, Safflower or Cotton-seed Oil",    gst: 5,  category: "Oils & Fats" },
  { code: "1513", description: "Coconut (Copra) Oil & Its Fractions",             gst: 5,  category: "Oils & Fats" },
  { code: "1514", description: "Rapeseed, Mustard & Canola Oil",                  gst: 5,  category: "Oils & Fats" },
  { code: "1515", description: "Other Fixed Vegetable Oils — Groundnut, Linseed", gst: 5,  category: "Oils & Fats" },
  { code: "1516", description: "Hydrogenated Vegetable Fats & Oils (Vanaspati)",  gst: 5,  category: "Oils & Fats" },
  { code: "1701", description: "Cane or Beet Sugar & Chemically Pure Sucrose",    gst: 5,  category: "Sugar & Sweeteners" },
  { code: "1702", description: "Lactose, Maltose, Glucose, Fructose Syrups",      gst: 18, category: "Sugar & Sweeteners" },
  { code: "1703", description: "Molasses from the Extraction of Sugar",           gst: 28, category: "Sugar & Sweeteners" },
  { code: "1704", description: "Sugar Confectionery (no cocoa) — Candies, Toffee",gst: 18, category: "Sugar & Sweeteners" },
  { code: "0901", description: "Coffee (roasted or instant) & Coffee Husks",      gst: 5,  category: "Beverages" },
  { code: "0902", description: "Tea (green or black, whether flavoured)",          gst: 5,  category: "Beverages" },
  { code: "2201", description: "Natural Mineral Water & Aerated Water",            gst: 0,  category: "Beverages" },
  { code: "2202", description: "Waters with Sugar / Flavour & Non-Alcoholic Drinks",gst: 12, category: "Beverages" },
  { code: "2203", description: "Beer Made from Malt",                              gst: 28, category: "Beverages" },
  { code: "1806", description: "Chocolate & Cocoa-based Food Products",            gst: 18, category: "Beverages" },
  { code: "0904", description: "Pepper, Dried Chilli & Capsicum",                 gst: 0,  category: "Spices & Condiments" },
  { code: "0906", description: "Cinnamon & Cinnamon-tree Flowers",                gst: 0,  category: "Spices & Condiments" },
  { code: "0907", description: "Cloves (whole fruit, cloves & stems)",            gst: 0,  category: "Spices & Condiments" },
  { code: "0908", description: "Nutmeg, Mace & Cardamoms",                        gst: 0,  category: "Spices & Condiments" },
  { code: "0910", description: "Ginger, Saffron, Turmeric, Thyme, Curry Powder", gst: 0,  category: "Spices & Condiments" },
  { code: "2103", description: "Sauces, Mixed Condiments & Seasonings, Mustard",  gst: 12, category: "Spices & Condiments" },
  { code: "2104", description: "Soups, Broths & Homogenized Composite Food",      gst: 18, category: "Spices & Condiments" },
  { code: "1601", description: "Sausages & Similar Products of Meat or Blood",    gst: 12, category: "Processed Foods" },
  { code: "1602", description: "Other Prepared / Preserved Meat, Offal or Blood", gst: 12, category: "Processed Foods" },
  { code: "1901", description: "Malt Extract, Infant Food, Cereal-based Preparations",gst: 18, category: "Processed Foods" },
  { code: "1902", description: "Pasta, Noodles, Couscous — Uncooked",             gst: 12, category: "Processed Foods" },
  { code: "1904", description: "Puffed Rice, Cornflakes, Popcorn & Breakfast Cereals",gst: 18, category: "Processed Foods" },
  { code: "1905", description: "Bread, Pastry, Cakes, Biscuits & Bakery Products",gst: 0,  category: "Processed Foods" },
  { code: "2005", description: "Other Prepared Vegetables (not frozen)",           gst: 12, category: "Processed Foods" },
  { code: "2007", description: "Jams, Jellies, Marmalades & Fruit Purées",        gst: 12, category: "Processed Foods" },
  { code: "2009", description: "Fruit Juices & Vegetable Juices",                 gst: 12, category: "Processed Foods" },
  { code: "3304", description: "Beauty / Makeup Preparations & Skin-care Creams", gst: 28, category: "Personal Care" },
  { code: "3305", description: "Shampoos, Hair Lacquers, Hair Creams & Oils",     gst: 18, category: "Personal Care" },
  { code: "3306", description: "Toothpaste, Dental Floss, Mouthwash",             gst: 18, category: "Personal Care" },
  { code: "3307", description: "Shaving Products, Deodorants, Bath Preparations", gst: 28, category: "Personal Care" },
  { code: "3401", description: "Soap & Organic Surface-active Products (bars)",   gst: 18, category: "Personal Care" },
  { code: "3402", description: "Washing Powders, Detergents & Cleaning Liquids",  gst: 18, category: "Cleaning" },
  { code: "3405", description: "Polishes & Creams for Footwear, Floors, Cars",    gst: 18, category: "Cleaning" },
  { code: "3808", description: "Insecticides, Rodenticides, Disinfectants",       gst: 18, category: "Cleaning" },
  { code: "9619", description: "Sanitary Towels, Napkins, Baby Diapers & Tampons",gst: 12, category: "Baby Products" },
  { code: "8471", description: "Computers, Laptops, Tablets & Processing Machines",gst: 18, category: "Electronics" },
  { code: "8517", description: "Telephones, Smartphones & Communication Equipment",gst: 12, category: "Electronics" },
  { code: "8528", description: "Monitors, TVs, Video Projectors & Receivers",     gst: 28, category: "Electronics" },
  { code: "4820", description: "Registers, Notebooks, Diaries, Binders, Folders", gst: 12, category: "Stationery" },
  { code: "9608", description: "Ball-point, Felt-tip, Fountain Pens & Pencils",   gst: 12, category: "Stationery" },
  { code: "4901", description: "Printed Books, Brochures & Similar Printed Matter",gst: 0,  category: "Stationery" },
];

/* ── HSN lookup helper ── */
function lookupHsn(code) {
  return HSN_CODES.find((h) => h.code === (code || "").trim()) || null;
}

/* ══════════════════════════════════════════════════════════════
   CLOUDINARY HELPERS
══════════════════════════════════════════════════════════════ */
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "vendor_products" }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

async function uploadMultipleToCloudinary(files = [], limit = 4) {
  if (!files || files.length === 0) return [];
  return Promise.all(files.slice(0, limit).map((f) => uploadToCloudinary(f.buffer)));
}

/* ══════════════════════════════════════════════════════════════
   PARSE HELPERS
══════════════════════════════════════════════════════════════ */
const parseJSON = (str, fallback = null) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

function parseSub(raw) {
  if (!raw || raw === "null" || raw === "") return null;
  try {
    const s = JSON.parse(raw);
    if (!s || !s.id) return null;
    return { id: s.id, name: s.name || "", image: s.image || "" };
  } catch { return null; }
}

function parseSubSub(raw) {
  if (!raw || raw === "null" || raw === "") return null;
  try {
    const s = JSON.parse(raw);
    if (!s || !s.id) return null;
    return { id: s.id, name: s.name || "", image: s.image || "" };
  } catch { return null; }
}

/* ══════════════════════════════════════════════════════════════
   buildProduct — normalises images + adds HSN info
══════════════════════════════════════════════════════════════ */
function buildProduct(p) {
  const hsnInfo = lookupHsn(p.hsnCode);
  const images  = p.images && p.images.length > 0
    ? p.images
    : p.image ? [p.image] : [];

  return {
    _id:            p._id,
    vendor:         p.vendor,
    name:           p.name,
    brand:          p.brand          || "",
    category:       p.category,
    subcategory:    p.subcategory,
    subSubCategory: p.subSubCategory,
    weight:         p.weight         || { value: 1, unit: "kg" },
    description:    p.description    || "",
    // ── images ──
    images,
    image: images[0] || "",
    // ── pricing ──
    basePrice:      p.basePrice,
    salePrice:      p.salePrice,
    discount:       p.discount       || 0,
    // ── GST / HSN ──
    gstPercent:     p.gstPercent     || 0,
    hsnCode:        p.hsnCode        || "",
    hsnDescription: hsnInfo?.description || "",
    hsnCategory:    hsnInfo?.category    || "",
    taxType:        p.taxType        || "cgst_sgst",
    validTill:      p.validTill,
    status:         p.status,
    createdAt:      p.createdAt,
    updatedAt:      p.updatedAt,
  };
}

/* ══════════════════════════════════════════════════════════════
   HSN CODES — GET ALL
   GET /api/vendor/products/hsn-codes
══════════════════════════════════════════════════════════════ */
exports.getHsnCodes = async (req, res) => {
  try {
    const { search, category } = req.query;
    let results = HSN_CODES;

    if (category) {
      results = results.filter(
        (h) => h.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (h) =>
          h.code.includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q)
      );
    }

    const grouped = results.reduce((acc, hsn) => {
      if (!acc[hsn.category]) acc[hsn.category] = [];
      acc[hsn.category].push(hsn);
      return acc;
    }, {});

    res.json({
      success:    true,
      total:      results.length,
      data:       results,
      grouped,
      categories: [...new Set(HSN_CODES.map((h) => h.category))],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   HSN CODE — LOOKUP SINGLE
   GET /api/vendor/products/hsn-codes/:code
══════════════════════════════════════════════════════════════ */
exports.getHsnByCode = async (req, res) => {
  try {
    const hsn = lookupHsn(req.params.code);
    if (!hsn)
      return res.status(404).json({ success: false, message: `HSN code ${req.params.code} not found` });
    res.json({ success: true, data: hsn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   CREATE PRODUCT
   Route: POST /api/vendor/products  — upload.array("files", 4)
══════════════════════════════════════════════════════════════ */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, description,
      basePrice, salePrice, status, weight,
      subcategory, subSubCategory,
      gstPercent, hsnCode, taxType, validTill,
    } = req.body;

    /* Category must exist */
    const categoryDoc = await VendorCategory.findById(category);
    if (!categoryDoc)
      return res.status(400).json({ success: false, message: "Invalid category" });

    /* Upload new images (up to 4) */
    const uploadedImages = await uploadMultipleToCloudinary(req.files, 4);

    /* Weight */
    let parsedWeight = { value: 1, unit: "kg" };
    if (weight) {
      parsedWeight = parseJSON(weight, parsedWeight);
      if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
      if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit)) parsedWeight.unit = "kg";
    }

    /* Prices */
    const base = Number(basePrice);
    if (isNaN(base))
      return res.status(400).json({ success: false, message: "Invalid base price" });

    /* HSN — auto-fill GST if not explicitly provided */
    const hsnEntry = lookupHsn(hsnCode);
    const gst =
      gstPercent !== undefined && gstPercent !== ""
        ? Number(gstPercent)
        : (hsnEntry?.gst ?? 0);

    /* Sale price — if not provided, compute base + GST (no profit/loss for vendor) */
    const sale = salePrice !== undefined && salePrice !== ""
      ? Number(salePrice)
      : base + (base * gst) / 100;

    const subCat    = parseSub(subcategory);
    const subSubCat = parseSubSub(subSubCategory);

    const product = await VendorProduct.create({
      vendor:         req.vendor.id,
      name,
      brand:          brand          || "",
      category:       categoryDoc._id,
      subcategory:    subCat    || { id: null, name: null, image: null },
      subSubCategory: subSubCat || { id: null, name: null, image: null },
      weight:         parsedWeight,
      description:    description    || "",
      // ── multi-image ──
      images: uploadedImages,
      image:  uploadedImages[0] || "",
      // ── pricing ──
      basePrice:  base,
      salePrice:  sale,
      discount:   base > sale ? base - sale : 0,
      // ── GST / HSN ──
      gstPercent: gst,
      hsnCode:    hsnCode   || "",
      taxType:    taxType   || "cgst_sgst",
      validTill:  validTill || undefined,
      status:     status    || "inactive",
    });

    res.status(201).json({ success: true, data: buildProduct(product) });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   GET MY PRODUCTS (flat list)
   GET /api/vendor/products
══════════════════════════════════════════════════════════════ */
exports.getMyProducts = async (req, res) => {
  try {
    const products = await VendorProduct.find({ vendor: req.vendor.id })
      .populate("category", "name image subcategories")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products.map(buildProduct) });
  } catch (err) {
    console.error("getMyProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   GET PRODUCTS TREE  (Category > Sub > SubSub > Products)
   GET /api/vendor/products/tree
══════════════════════════════════════════════════════════════ */
exports.getVendorProductsTree = async (req, res) => {
  try {
    const vendorId   = req.vendor.id;
    const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
    const products   = await VendorProduct.find({ vendor: vendorId }).lean();

    const data = categories.map((cat) => {
      const subcategories = (cat.subcategories || [])
        .filter((s) => s.active)
        .map((sub) => {
          const subSubCategories = (sub.subSubCategories || [])
            .filter((ss) => ss.active)
            .map((ss) => {
              const ssProducts = products
                .filter(
                  (p) =>
                    String(p.category) === String(cat._id) &&
                    p.subcategory?.id  === String(sub._id) &&
                    p.subSubCategory?.id === String(ss._id)
                )
                .map(buildProduct);
              return { _id: ss._id, name: ss.name, image: ss.image, products: ssProducts };
            });

          const directProducts = products
            .filter(
              (p) =>
                String(p.category) === String(cat._id) &&
                p.subcategory?.id  === String(sub._id) &&
                !p.subSubCategory?.id
            )
            .map(buildProduct);

          return { _id: sub._id, name: sub.name, image: sub.image, subSubCategories, products: directProducts };
        });

      return { _id: cat._id, name: cat.name, image: cat.image, subcategories };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("getVendorProductsTree error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   UPDATE PRODUCT
   Route: PUT /api/vendor/products/:id  — upload.array("files", 4)
══════════════════════════════════════════════════════════════ */
exports.updateProduct = async (req, res) => {
  try {
    const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, brand, description, status, category,
      weight, subcategory, subSubCategory,
      basePrice, salePrice, gstPercent, hsnCode, taxType, validTill,
    } = req.body;

    /* ── Image handling ──────────────────────────────────────────────
       Frontend sends:
         existingImages  → JSON array of Cloudinary URLs to KEEP (in order)
         files[]         → new image files to upload
       Merge: kept + newly-uploaded, capped at 4.
    ─────────────────────────────────────────────────────────────── */
    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch {}
    }

    const slotsLeft     = Math.max(0, 4 - existingImages.length);
    const newlyUploaded = await uploadMultipleToCloudinary(req.files || [], slotsLeft);
    const mergedImages  = [...existingImages, ...newlyUploaded].slice(0, 4);

    product.images = mergedImages;
    product.image  = mergedImages[0] || product.image || "";

    /* ── Scalar fields ── */
    if (name        !== undefined) product.name        = name;
    if (brand       !== undefined) product.brand       = brand;
    if (description !== undefined) product.description = description;
    if (status      !== undefined) product.status      = status;
    if (category    !== undefined) product.category    = category;
    if (validTill   !== undefined) product.validTill   = validTill || undefined;

    if (subcategory !== undefined)
      product.subcategory    = parseSub(subcategory)    || { id: null, name: null, image: null };
    if (subSubCategory !== undefined)
      product.subSubCategory = parseSubSub(subSubCategory) || { id: null, name: null, image: null };

    if (weight !== undefined) {
      const w = parseJSON(weight);
      if (w) { if (w.unit === "g") w.unit = "gm"; product.weight = w; }
    }

    if (basePrice !== undefined) product.basePrice = Number(basePrice);

    /* HSN — auto-fill GST when HSN changes and gstPercent not explicitly sent */
    if (hsnCode !== undefined) {
      product.hsnCode = hsnCode;
      if (gstPercent === undefined || gstPercent === "") {
        const hsnEntry = lookupHsn(hsnCode);
        if (hsnEntry) product.gstPercent = hsnEntry.gst;
      }
    }

    const resolvedGst =
      gstPercent !== undefined && gstPercent !== ""
        ? Number(gstPercent)
        : Number(product.gstPercent || 0);

    product.gstPercent = resolvedGst;
    if (taxType !== undefined) product.taxType = taxType;

    /* Recalculate sale price if not explicitly supplied */
    if (salePrice !== undefined && salePrice !== "") {
      product.salePrice = Number(salePrice);
    } else {
      const base = Number(product.basePrice);
      product.salePrice = base + (base * resolvedGst) / 100;
    }

    product.discount = product.basePrice > product.salePrice
      ? product.basePrice - product.salePrice
      : 0;

    await product.save();
    res.json({ success: true, data: buildProduct(product) });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   DELETE PRODUCT
   DELETE /api/vendor/products/:id
══════════════════════════════════════════════════════════════ */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await VendorProduct.deleteOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!deleted.deletedCount)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   STATUS UPDATE
   PUT /api/vendor/products/status/:id
══════════════════════════════════════════════════════════════ */
exports.updateStatus = async (req, res) => {
  try {
    const updated = await VendorProduct.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor.id },
      { status: req.body.status },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: buildProduct(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   COPY PRODUCT
   POST /api/vendor/products/copy/:id
══════════════════════════════════════════════════════════════ */
exports.copyProduct = async (req, res) => {
  try {
    const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!item)
      return res.status(404).json({ success: false, message: "Product not found" });

    const newItem = await VendorProduct.create({
      vendor:         req.vendor.id,
      name:           item.name + " (Copy)",
      brand:          item.brand          || "",
      category:       item.category,
      subcategory:    item.subcategory,
      subSubCategory: item.subSubCategory,
      weight:         item.weight,
      description:    item.description,
      images:         item.images && item.images.length > 0 ? [...item.images] : [],
      image:          item.image  || "",
      basePrice:      item.basePrice,
      salePrice:      item.salePrice,
      discount:       item.discount,
      gstPercent:     item.gstPercent     || 0,
      hsnCode:        item.hsnCode        || "",
      taxType:        item.taxType        || "cgst_sgst",
      validTill:      item.validTill,
      status:         "inactive",
    });

    res.json({ success: true, data: buildProduct(newItem) });
  } catch (err) {
    console.error("copyProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   BULK UPDATE
   POST /api/vendor/products/bulk-update
══════════════════════════════════════════════════════════════ */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const updated = [];
    for (const p of req.body.products) {
      const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
      if (!item) continue;
      if (p.basePrice  !== undefined) item.basePrice  = Number(p.basePrice);
      if (p.salePrice  !== undefined) item.salePrice  = Number(p.salePrice);
      if (p.gstPercent !== undefined) item.gstPercent = Number(p.gstPercent);
      if (p.hsnCode    !== undefined) item.hsnCode    = p.hsnCode;
      if (p.taxType    !== undefined) item.taxType    = p.taxType;
      if (p.brand      !== undefined) item.brand      = p.brand;
      if (p.status     !== undefined) item.status     = p.status;
      item.discount = item.basePrice > item.salePrice ? item.basePrice - item.salePrice : 0;
      await item.save();
      updated.push(buildProduct(item));
    }
    res.json({ success: true, updated });
  } catch (err) {
    console.error("bulkUpdateProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   BULK DELETE
   POST /api/vendor/products/delete-selected
══════════════════════════════════════════════════════════════ */
exports.deleteSelected = async (req, res) => {
  try {
    await VendorProduct.deleteMany({ _id: { $in: req.body.ids }, vendor: req.vendor.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   EXPORT CSV (all)
   GET /api/vendor/products/export
══════════════════════════════════════════════════════════════ */
exports.exportProducts = async (req, res) => {
  try {
    const data = await VendorProduct.find({ vendor: req.vendor.id }).populate("category", "name");

    res.setHeader("Content-Disposition", "attachment; filename=vendor_products.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);

    data.forEach((p) => {
      const hsnInfo = lookupHsn(p.hsnCode);
      const images  = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
      csvStream.write({
        id:             p._id,
        name:           p.name,
        brand:          p.brand               || "",
        category:       p.category?.name      || "",
        subcategory:    p.subcategory?.name    || "",
        subSubCategory: p.subSubCategory?.name || "",
        image:          images[0]             || "",
        images:         images.join("|"),
        weight:         JSON.stringify(p.weight),
        description:    p.description         || "",
        basePrice:      p.basePrice,
        salePrice:      p.salePrice,
        discount:       p.discount,
        gstPercent:     p.gstPercent           || 0,
        hsnCode:        p.hsnCode              || "",
        hsnDescription: hsnInfo?.description   || "",
        taxType:        p.taxType              || "cgst_sgst",
        status:         p.status,
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("exportProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   EXPORT SELECTED CSV
   POST /api/vendor/products/export-selected
══════════════════════════════════════════════════════════════ */
exports.exportSelected = async (req, res) => {
  try {
    const data = await VendorProduct.find({
      _id: { $in: req.body.ids || [] },
      vendor: req.vendor.id,
    }).populate("category", "name");

    res.setHeader("Content-Disposition", "attachment; filename=selected_vendor_products.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);

    data.forEach((p) => {
      const hsnInfo = lookupHsn(p.hsnCode);
      const images  = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
      csvStream.write({
        id:             p._id,
        name:           p.name,
        brand:          p.brand               || "",
        category:       p.category?.name      || "",
        subcategory:    p.subcategory?.name    || "",
        subSubCategory: p.subSubCategory?.name || "",
        image:          images[0]             || "",
        images:         images.join("|"),
        weight:         JSON.stringify(p.weight),
        description:    p.description         || "",
        basePrice:      p.basePrice,
        salePrice:      p.salePrice,
        discount:       p.discount,
        gstPercent:     p.gstPercent           || 0,
        hsnCode:        p.hsnCode              || "",
        hsnDescription: hsnInfo?.description   || "",
        taxType:        p.taxType              || "cgst_sgst",
        status:         p.status,
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("exportSelected error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   IMPORT CSV
   POST /api/vendor/products/import
   CSV columns: name, brand, category, subcategory, subSubCategory,
                image (URL), weight (JSON), description,
                basePrice, salePrice, gstPercent, hsnCode, taxType, status
══════════════════════════════════════════════════════════════ */
exports.importProducts = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "CSV file required" });

    const rows = [];
    const fileStr = req.file.buffer.toString("utf-8");

    await new Promise((resolve, reject) => {
      csv.parseString(fileStr, { headers: true })
        .on("data", (row) => rows.push(row))
        .on("end",  resolve)
        .on("error", reject);
    });

    let imported = 0;

    for (const r of rows) {
      try {
        const base = Number(r.basePrice || 0);

        /* HSN / GST */
        const hsnCode  = r.hsnCode || "";
        const hsnEntry = lookupHsn(hsnCode);
        const gst      = r.gstPercent ? Number(r.gstPercent) : (hsnEntry?.gst ?? 0);
        const sale     = r.salePrice  ? Number(r.salePrice)  : base + (base * gst) / 100;

        /* Weight */
        let weight = { value: 1, unit: "kg" };
        if (r.weight) { try { weight = JSON.parse(r.weight); } catch {} }
        if (weight.unit === "g") weight.unit = "gm";

        /* Category */
        const cat = await VendorCategory.findOne({ name: r.category?.trim() });
        if (!cat) { console.log("Category not found:", r.category); continue; }

        /* Subcategory */
        let subCat = { id: null, name: null, image: null };
        if (r.subcategory) {
          const sub = cat.subcategories?.find(
            (s) => s.name.toLowerCase() === r.subcategory.trim().toLowerCase()
          );
          if (sub) subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
        }

        /* Sub-Subcategory */
        let subSubCat = { id: null, name: null, image: null };
        if (r.subSubCategory && subCat.id) {
          const sub = cat.subcategories?.find((s) => s._id.toString() === subCat.id);
          const ss  = sub?.subSubCategories?.find(
            (x) => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase()
          );
          if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
        }

        /* Image */
        const imageUrl = r.image?.startsWith("http") ? r.image.trim() : "";

        await VendorProduct.create({
          vendor:         req.vendor.id,
          name:           r.name,
          brand:          r.brand        || "",
          category:       cat._id,
          subcategory:    subCat,
          subSubCategory: subSubCat,
          weight,
          description:    r.description  || "",
          images:         imageUrl ? [imageUrl] : [],
          image:          imageUrl,
          basePrice:      base,
          salePrice:      sale,
          discount:       base > sale ? base - sale : 0,
          gstPercent:     gst,
          hsnCode,
          taxType:        r.taxType      || "cgst_sgst",
          status:         r.status       || "inactive",
        });

        imported++;
      } catch (e) {
        console.log("Row skipped:", r.name, e.message);
      }
    }

    res.json({ success: true, imported });
  } catch (err) {
    console.error("importProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};