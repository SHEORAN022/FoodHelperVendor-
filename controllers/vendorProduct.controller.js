// const mongoose = require("mongoose");
// const VendorProduct = require("../models/vendorProduct");
// const VendorCategory = require("../models/VendorCategory");
// const cloudinary = require("../utils/cloudinary");
// const csv = require("fast-csv");

// // ✅ Safe HsnCode import
// const HsnCode =
//   mongoose.models.HsnCode || require("../models/Hsncode");

// /* ══════════════════════════════════════════════════════════════
//    CLOUDINARY HELPERS
// ══════════════════════════════════════════════════════════════ */
// const uploadToFolder = (buffer, folder) =>
//   new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder }, (err, result) => {
//         if (err) reject(err);
//         else resolve(result.secure_url);
//       })
//       .end(buffer);
//   });

// const uploadMain = (buffer) =>
//   uploadToFolder(buffer, "price_images/main");
// const uploadGallery = (buffer) =>
//   uploadToFolder(buffer, "price_images/gallery");

// async function uploadManyGallery(files = [], limit = 4) {
//   if (!files || !files.length) return [];
//   return Promise.all(
//     files.slice(0, limit).map((f) => uploadGallery(f.buffer))
//   );
// }

// /* ══════════════════════════════════════════════════════════════
//    PARSE HELPERS
// ══════════════════════════════════════════════════════════════ */
// const parseJSON = (str, fallback = null) => {
//   try {
//     return JSON.parse(str);
//   } catch {
//     return fallback;
//   }
// };

// function parseSub(raw) {
//   if (!raw || raw === "null" || raw === "") return null;
//   try {
//     const s = JSON.parse(raw);
//     if (!s || !s.id) return null;
//     return { id: s.id, name: s.name || "", image: s.image || "" };
//   } catch {
//     return null;
//   }
// }

// function parseSubSub(raw) {
//   if (!raw || raw === "null" || raw === "") return null;
//   try {
//     const s = JSON.parse(raw);
//     if (!s || !s.id) return null;
//     return { id: s.id, name: s.name || "", image: s.image || "" };
//   } catch {
//     return null;
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    HSN MAP HELPER
// ══════════════════════════════════════════════════════════════ */
// async function getHsnMap() {
//   const allHsn = await HsnCode.find({ active: true }).lean();
//   return allHsn.reduce((acc, h) => {
//     acc[h.code.trim()] = h;
//     return acc;
//   }, {});
// }

// /* ══════════════════════════════════════════════════════════════
//    buildProduct — ✅ profit included
// ══════════════════════════════════════════════════════════════ */
// function buildProduct(p, hsnMap = {}) {
//   const hsnInfo = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
//   return {
//     _id: p._id,
//     vendor: p.vendor,
//     name: p.name,
//     brand: p.brand || "",
//     category: p.category,
//     subcategory: p.subcategory,
//     subSubCategory: p.subSubCategory,
//     weight: p.weight || { value: 1, unit: "kg" },
//     description: p.description || "",
//     image: p.image || "",
//     galleryImages: p.galleryImages || [],
//     basePrice: p.basePrice,
//     salePrice: p.salePrice,
//     profit: p.profit || 0,          // ✅ profit always included
//     discount: p.discount || 0,
//     gstPercent: p.gstPercent || 0,
//     hsnCode: p.hsnCode || "",
//     hsnDescription: hsnInfo?.description || "",
//     hsnCategory: hsnInfo?.category || "",
//     taxType: p.taxType || "cgst_sgst",
//     validTill: p.validTill,
//     status: p.status,
//     createdAt: p.createdAt,
//     updatedAt: p.updatedAt,
//   };
// }

// /* ══════════════════════════════════════════════════════════════
//    HSN CODES — GET ALL
//    GET /api/vendor/products/hsn-codes
// ══════════════════════════════════════════════════════════════ */
// exports.getHsnCodes = async (req, res) => {
//   try {
//     const { search, category } = req.query;
//     const query = { active: true };

//     if (category)
//       query.category = new RegExp("^" + category + "$", "i");
//     if (search) {
//       const q = new RegExp(search, "i");
//       query.$or = [{ code: q }, { description: q }, { category: q }];
//     }

//     const results = await HsnCode.find(query)
//       .sort({ category: 1, code: 1 })
//       .lean();
//     const categories = await HsnCode.distinct("category", {
//       active: true,
//     });

//     const grouped = results.reduce((acc, h) => {
//       if (!acc[h.category]) acc[h.category] = [];
//       acc[h.category].push(h);
//       return acc;
//     }, {});

//     res.json({
//       success: true,
//       total: results.length,
//       data: results,
//       grouped,
//       categories,
//     });
//   } catch (err) {
//     console.error("getHsnCodes error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    HSN — SINGLE
//    GET /api/vendor/products/hsn-codes/:code
// ══════════════════════════════════════════════════════════════ */
// exports.getHsnByCode = async (req, res) => {
//   try {
//     const hsn = await HsnCode.findOne({
//       code: req.params.code.trim(),
//       active: true,
//     }).lean();
//     if (!hsn)
//       return res.status(404).json({
//         success: false,
//         message: "HSN code " + req.params.code + " not found",
//       });
//     res.json({ success: true, data: hsn });
//   } catch (err) {
//     console.error("getHsnByCode error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    HSN — CREATE NEW
//    POST /api/vendor/products/hsn-codes
// ══════════════════════════════════════════════════════════════ */
// exports.createHsnCode = async (req, res) => {
//   try {
//     const { code, description, category, gst } = req.body;

//     if (!code || !description || !category || gst === undefined)
//       return res.status(400).json({
//         success: false,
//         message: "code, description, category & gst are required",
//       });

//     const existing = await HsnCode.findOne({ code: code.trim() });
//     if (existing)
//       return res.status(409).json({
//         success: false,
//         message: "HSN code " + code + " already exists",
//       });

//     const hsn = await HsnCode.create({
//       code: code.trim(),
//       description: description.trim(),
//       category: category.trim(),
//       gst: Number(gst),
//     });

//     res.status(201).json({ success: true, data: hsn });
//   } catch (err) {
//     console.error("createHsnCode error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    CREATE PRODUCT
//    POST /api/vendor/products
// ══════════════════════════════════════════════════════════════ */
// exports.createProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       brand,
//       category,
//       description,
//       basePrice,
//       salePrice,
//       profit,
//       status,
//       weight,
//       subcategory,
//       subSubCategory,
//       gstPercent,
//       hsnCode,
//       taxType,
//       validTill,
//     } = req.body;

//     const categoryDoc = await VendorCategory.findById(category);
//     if (!categoryDoc)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid category" });

//     const mainFile = req.files?.mainImage?.[0];
//     const mainUrl = mainFile ? await uploadMain(mainFile.buffer) : "";
//     const galleryFiles = req.files?.galleryImages || [];
//     const galleryUrls = await uploadManyGallery(galleryFiles, 4);

//     // Weight parse
//     let parsedWeight = { value: 1, unit: "kg" };
//     if (weight) {
//       parsedWeight = parseJSON(weight, parsedWeight);
//       if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
//       if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit))
//         parsedWeight.unit = "kg";
//     }

//     const base = Number(basePrice);
//     if (isNaN(base))
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid base price" });

//     // HSN + GST resolve
//     const hsnEntry = hsnCode
//       ? await HsnCode.findOne({
//           code: hsnCode.trim(),
//           active: true,
//         }).lean()
//       : null;
//     const gst =
//       gstPercent !== undefined && gstPercent !== ""
//         ? Number(gstPercent)
//         : hsnEntry?.gst ?? 0;

//     // ✅ profit — properly saved
//     const profitAmt =
//       profit !== undefined && profit !== "" ? Number(profit) : 0;

//     // salePrice: manual override ya base+profit
//     const sale =
//       salePrice !== undefined && salePrice !== ""
//         ? Number(salePrice)
//         : base + profitAmt;

//     const subCat = parseSub(subcategory);
//     const subSubCat = parseSubSub(subSubCategory);

//     const product = await VendorProduct.create({
//       vendor: req.vendor.id,
//       name,
//       brand: brand || "",
//       category: categoryDoc._id,
//       subcategory: subCat || { id: null, name: null, image: null },
//       subSubCategory: subSubCat || {
//         id: null,
//         name: null,
//         image: null,
//       },
//       weight: parsedWeight,
//       description: description || "",
//       image: mainUrl,
//       galleryImages: galleryUrls,
//       basePrice: base,
//       salePrice: sale,
//       profit: profitAmt,             // ✅
//       discount: base > sale ? base - sale : 0,
//       gstPercent: gst,
//       hsnCode: hsnCode || "",
//       taxType: taxType || "cgst_sgst",
//       validTill: validTill || undefined,
//       status: status || "inactive",
//     });

//     const hsnMap = await getHsnMap();
//     res
//       .status(201)
//       .json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
//   } catch (err) {
//     console.error("createProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    GET MY PRODUCTS
//    GET /api/vendor/products
// ══════════════════════════════════════════════════════════════ */
// exports.getMyProducts = async (req, res) => {
//   try {
//     const products = await VendorProduct.find({ vendor: req.vendor.id })
//       .populate("category", "name image subcategories")
//       .sort({ createdAt: -1 })
//       .lean();

//     const hsnMap = await getHsnMap();
//     const data = products.map((p) => buildProduct(p, hsnMap));

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("getMyProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    GET PRODUCTS TREE
//    GET /api/vendor/products/tree
// ══════════════════════════════════════════════════════════════ */
// exports.getVendorProductsTree = async (req, res) => {
//   try {
//     const vendorId = req.vendor.id;
//     const categories = await VendorCategory.find({
//       vendor: vendorId,
//       status: "approved",
//       active: true,
//     }).lean();
//     const products = await VendorProduct.find({
//       vendor: vendorId,
//     }).lean();

//     const data = categories.map((cat) => {
//       const subcategories = (cat.subcategories || [])
//         .filter((s) => s.active)
//         .map((sub) => {
//           const subSubCategories = (sub.subSubCategories || [])
//             .filter((ss) => ss.active)
//             .map((ss) => {
//               const ssProducts = products.filter(
//                 (p) =>
//                   String(p.category) === String(cat._id) &&
//                   p.subcategory?.id === String(sub._id) &&
//                   p.subSubCategory?.id === String(ss._id)
//               );
//               return {
//                 _id: ss._id,
//                 name: ss.name,
//                 image: ss.image,
//                 products: ssProducts,
//               };
//             });

//           const directProducts = products.filter(
//             (p) =>
//               String(p.category) === String(cat._id) &&
//               p.subcategory?.id === String(sub._id) &&
//               !p.subSubCategory?.id
//           );

//           return {
//             _id: sub._id,
//             name: sub.name,
//             image: sub.image,
//             subSubCategories,
//             products: directProducts,
//           };
//         });

//       return {
//         _id: cat._id,
//         name: cat.name,
//         image: cat.image,
//         subcategories,
//       };
//     });

//     res.json({ success: true, data });
//   } catch (err) {
//     console.error("getVendorProductsTree error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    UPDATE PRODUCT
//    PUT /api/vendor/products/:id
// ══════════════════════════════════════════════════════════════ */
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await VendorProduct.findOne({
//       _id: req.params.id,
//       vendor: req.vendor.id,
//     });
//     if (!product)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     const {
//       name,
//       brand,
//       description,
//       status,
//       category,
//       weight,
//       subcategory,
//       subSubCategory,
//       basePrice,
//       salePrice,
//       profit,
//       gstPercent,
//       hsnCode,
//       taxType,
//       validTill,
//     } = req.body;

//     // Main image
//     const mainFile = req.files?.mainImage?.[0];
//     if (mainFile) {
//       product.image = await uploadMain(mainFile.buffer);
//     } else if (req.body.existingMainImage !== undefined) {
//       product.image = req.body.existingMainImage;
//     }

//     // Gallery images
//     let existingGallery = [];
//     try {
//       existingGallery = JSON.parse(
//         req.body.existingGalleryImages || "[]"
//       );
//     } catch {}
//     const galleryFiles = req.files?.galleryImages || [];
//     const slotsLeft = Math.max(0, 4 - existingGallery.length);
//     const newGallery = await uploadManyGallery(galleryFiles, slotsLeft);
//     product.galleryImages = [
//       ...existingGallery,
//       ...newGallery,
//     ].slice(0, 4);

//     // Basic fields
//     if (name !== undefined) product.name = name;
//     if (brand !== undefined) product.brand = brand;
//     if (description !== undefined) product.description = description;
//     if (status !== undefined) product.status = status;
//     if (category !== undefined) product.category = category;
//     if (validTill !== undefined)
//       product.validTill = validTill || undefined;

//     // Subcategory
//     if (subcategory !== undefined)
//       product.subcategory =
//         parseSub(subcategory) || { id: null, name: null, image: null };
//     if (subSubCategory !== undefined)
//       product.subSubCategory =
//         parseSubSub(subSubCategory) || {
//           id: null,
//           name: null,
//           image: null,
//         };

//     // Weight
//     if (weight !== undefined) {
//       const w = parseJSON(weight);
//       if (w) {
//         if (w.unit === "g") w.unit = "gm";
//         product.weight = w;
//       }
//     }

//     // Base price
//     if (basePrice !== undefined) product.basePrice = Number(basePrice);

//     // HSN + GST
//     if (hsnCode !== undefined) {
//       product.hsnCode = hsnCode;
//       if (gstPercent === undefined || gstPercent === "") {
//         const hsnEntry = await HsnCode.findOne({
//           code: hsnCode.trim(),
//           active: true,
//         }).lean();
//         if (hsnEntry) product.gstPercent = hsnEntry.gst;
//       }
//     }
//     const resolvedGst =
//       gstPercent !== undefined && gstPercent !== ""
//         ? Number(gstPercent)
//         : Number(product.gstPercent || 0);
//     product.gstPercent = resolvedGst;

//     if (taxType !== undefined) product.taxType = taxType;

//     // ✅ profit — properly updated
//     if (profit !== undefined && profit !== "") {
//       product.profit = Number(profit);
//     }

//     // Sale price: manual override ya base+profit
//     if (salePrice !== undefined && salePrice !== "") {
//       product.salePrice = Number(salePrice);
//     } else {
//       product.salePrice =
//         Number(product.basePrice) + Number(product.profit || 0);
//     }

//     product.discount =
//       product.basePrice > product.salePrice
//         ? product.basePrice - product.salePrice
//         : 0;

//     await product.save();

//     const hsnMap = await getHsnMap();
//     res.json({
//       success: true,
//       data: buildProduct(product.toObject(), hsnMap),
//     });
//   } catch (err) {
//     console.error("updateProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    DELETE PRODUCT
//    DELETE /api/vendor/products/:id
// ══════════════════════════════════════════════════════════════ */
// exports.deleteProduct = async (req, res) => {
//   try {
//     const deleted = await VendorProduct.deleteOne({
//       _id: req.params.id,
//       vendor: req.vendor.id,
//     });
//     if (!deleted.deletedCount)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });
//     res.json({ success: true, message: "Product deleted" });
//   } catch (err) {
//     console.error("deleteProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    UPDATE STATUS
//    PUT /api/vendor/products/status/:id
// ══════════════════════════════════════════════════════════════ */
// exports.updateStatus = async (req, res) => {
//   try {
//     const updated = await VendorProduct.findOneAndUpdate(
//       { _id: req.params.id, vendor: req.vendor.id },
//       { status: req.body.status },
//       { new: true }
//     ).lean();

//     if (!updated)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     const hsnMap = await getHsnMap();
//     res.json({ success: true, data: buildProduct(updated, hsnMap) });
//   } catch (err) {
//     console.error("updateStatus error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    COPY PRODUCT
//    POST /api/vendor/products/copy/:id
// ══════════════════════════════════════════════════════════════ */
// exports.copyProduct = async (req, res) => {
//   try {
//     const item = await VendorProduct.findOne({
//       _id: req.params.id,
//       vendor: req.vendor.id,
//     }).lean();
//     if (!item)
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found" });

//     const newItem = await VendorProduct.create({
//       vendor: req.vendor.id,
//       name: item.name + " (Copy)",
//       brand: item.brand || "",
//       category: item.category,
//       subcategory: item.subcategory,
//       subSubCategory: item.subSubCategory,
//       weight: item.weight,
//       description: item.description,
//       image: item.image || "",
//       galleryImages: item.galleryImages ? [...item.galleryImages] : [],
//       basePrice: item.basePrice,
//       salePrice: item.salePrice,
//       profit: item.profit || 0,      // ✅ profit copied
//       discount: item.discount,
//       gstPercent: item.gstPercent || 0,
//       hsnCode: item.hsnCode || "",
//       taxType: item.taxType || "cgst_sgst",
//       validTill: item.validTill,
//       status: "inactive",
//     });

//     const hsnMap = await getHsnMap();
//     res.json({
//       success: true,
//       data: buildProduct(newItem.toObject(), hsnMap),
//     });
//   } catch (err) {
//     console.error("copyProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    BULK UPDATE
//    POST /api/vendor/products/bulk-update
// ══════════════════════════════════════════════════════════════ */
// exports.bulkUpdateProducts = async (req, res) => {
//   try {
//     const hsnMap = await getHsnMap();
//     const updated = [];

//     for (const p of req.body.products) {
//       const item = await VendorProduct.findOne({
//         _id: p.id,
//         vendor: req.vendor.id,
//       });
//       if (!item) continue;

//       if (p.basePrice !== undefined) item.basePrice = Number(p.basePrice);
//       if (p.salePrice !== undefined) item.salePrice = Number(p.salePrice);
//       if (p.profit !== undefined) item.profit = Number(p.profit); // ✅
//       if (p.gstPercent !== undefined)
//         item.gstPercent = Number(p.gstPercent);
//       if (p.hsnCode !== undefined) item.hsnCode = p.hsnCode;
//       if (p.taxType !== undefined) item.taxType = p.taxType;
//       if (p.brand !== undefined) item.brand = p.brand;
//       if (p.status !== undefined) item.status = p.status;

//       item.discount =
//         item.basePrice > item.salePrice
//           ? item.basePrice - item.salePrice
//           : 0;

//       await item.save();
//       updated.push(buildProduct(item.toObject(), hsnMap));
//     }

//     res.json({ success: true, updated });
//   } catch (err) {
//     console.error("bulkUpdateProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    DELETE SELECTED
//    POST /api/vendor/products/delete-selected
// ══════════════════════════════════════════════════════════════ */
// exports.deleteSelected = async (req, res) => {
//   try {
//     await VendorProduct.deleteMany({
//       _id: { $in: req.body.ids },
//       vendor: req.vendor.id,
//     });
//     res.json({ success: true });
//   } catch (err) {
//     console.error("deleteSelected error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    EXPORT ALL
//    GET /api/vendor/products/export
// ══════════════════════════════════════════════════════════════ */
// exports.exportProducts = async (req, res) => {
//   try {
//     const data = await VendorProduct.find({ vendor: req.vendor.id })
//       .populate("category", "name")
//       .lean();
//     const hsnMap = await getHsnMap();

//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=vendor_products.csv"
//     );
//     res.setHeader("Content-Type", "text/csv");

//     const csvStream = csv.format({ headers: true });
//     csvStream.pipe(res);

//     for (const p of data) {
//       const hsnInfo = p.hsnCode
//         ? hsnMap[p.hsnCode.trim()] || null
//         : null;
//       csvStream.write({
//         id: p._id,
//         name: p.name,
//         brand: p.brand || "",
//         category: p.category?.name || "",
//         subcategory: p.subcategory?.name || "",
//         subSubCategory: p.subSubCategory?.name || "",
//         image: p.image || "",
//         galleryImages: (p.galleryImages || []).join("|"),
//         weight: JSON.stringify(p.weight),
//         description: p.description || "",
//         basePrice: p.basePrice,
//         salePrice: p.salePrice,
//         profit: p.profit || 0,       // ✅
//         discount: p.discount,
//         gstPercent: p.gstPercent || 0,
//         hsnCode: p.hsnCode || "",
//         hsnDescription: hsnInfo?.description || "",
//         taxType: p.taxType || "cgst_sgst",
//         status: p.status,
//       });
//     }

//     csvStream.end();
//   } catch (err) {
//     console.error("exportProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    EXPORT SELECTED
//    POST /api/vendor/products/export-selected
// ══════════════════════════════════════════════════════════════ */
// exports.exportSelected = async (req, res) => {
//   try {
//     const data = await VendorProduct.find({
//       _id: { $in: req.body.ids || [] },
//       vendor: req.vendor.id,
//     })
//       .populate("category", "name")
//       .lean();

//     const hsnMap = await getHsnMap();

//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=selected_vendor_products.csv"
//     );
//     res.setHeader("Content-Type", "text/csv");

//     const csvStream = csv.format({ headers: true });
//     csvStream.pipe(res);

//     for (const p of data) {
//       const hsnInfo = p.hsnCode
//         ? hsnMap[p.hsnCode.trim()] || null
//         : null;
//       csvStream.write({
//         id: p._id,
//         name: p.name,
//         brand: p.brand || "",
//         category: p.category?.name || "",
//         subcategory: p.subcategory?.name || "",
//         subSubCategory: p.subSubCategory?.name || "",
//         image: p.image || "",
//         galleryImages: (p.galleryImages || []).join("|"),
//         weight: JSON.stringify(p.weight),
//         description: p.description || "",
//         basePrice: p.basePrice,
//         salePrice: p.salePrice,
//         profit: p.profit || 0,       // ✅
//         discount: p.discount,
//         gstPercent: p.gstPercent || 0,
//         hsnCode: p.hsnCode || "",
//         hsnDescription: hsnInfo?.description || "",
//         taxType: p.taxType || "cgst_sgst",
//         status: p.status,
//       });
//     }

//     csvStream.end();
//   } catch (err) {
//     console.error("exportSelected error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    IMPORT CSV
//    POST /api/vendor/products/import
// ══════════════════════════════════════════════════════════════ */
// exports.importProducts = async (req, res) => {
//   try {
//     if (!req.file)
//       return res
//         .status(400)
//         .json({ success: false, message: "CSV file required" });

//     const rows = [];
//     await new Promise((resolve, reject) => {
//       csv
//         .parseString(req.file.buffer.toString("utf-8"), {
//           headers: true,
//         })
//         .on("data", (row) => rows.push(row))
//         .on("end", resolve)
//         .on("error", reject);
//     });

//     const hsnMap = await getHsnMap();
//     let imported = 0;

//     for (const r of rows) {
//       try {
//         const base = Number(r.basePrice || 0);
//         const hsnCode = r.hsnCode || "";
//         const hsnEntry = hsnCode ? hsnMap[hsnCode.trim()] || null : null;
//         const gst = r.gstPercent
//           ? Number(r.gstPercent)
//           : hsnEntry?.gst ?? 0;
//         const profitAmt = r.profit ? Number(r.profit) : 0;
//         const sale = r.salePrice
//           ? Number(r.salePrice)
//           : base + profitAmt;

//         let weight = { value: 1, unit: "kg" };
//         if (r.weight) {
//           try {
//             weight = JSON.parse(r.weight);
//           } catch {}
//         }
//         if (weight.unit === "g") weight.unit = "gm";

//         const cat = await VendorCategory.findOne({
//           name: r.category?.trim(),
//         });
//         if (!cat) {
//           console.log("Category not found:", r.category);
//           continue;
//         }

//         let subCat = { id: null, name: null, image: null };
//         let subSubCat = { id: null, name: null, image: null };

//         if (r.subcategory) {
//           const sub = cat.subcategories?.find(
//             (s) =>
//               s.name.toLowerCase() === r.subcategory.trim().toLowerCase()
//           );
//           if (sub) {
//             subCat = {
//               id: sub._id.toString(),
//               name: sub.name,
//               image: sub.image || null,
//             };
//             if (r.subSubCategory) {
//               const ss = sub.subSubCategories?.find(
//                 (x) =>
//                   x.name.toLowerCase() ===
//                   r.subSubCategory.trim().toLowerCase()
//               );
//               if (ss)
//                 subSubCat = {
//                   id: ss._id.toString(),
//                   name: ss.name,
//                   image: ss.image || null,
//                 };
//             }
//           }
//         }

//         const mainUrl =
//           r.image?.startsWith("http") ? r.image.trim() : "";
//         const galleryUrls = r.galleryImages
//           ? r.galleryImages
//               .split("|")
//               .map((u) => u.trim())
//               .filter((u) => u.startsWith("http"))
//               .slice(0, 4)
//           : [];

//         await VendorProduct.create({
//           vendor: req.vendor.id,
//           name: r.name,
//           brand: r.brand || "",
//           category: cat._id,
//           subcategory: subCat,
//           subSubCategory: subSubCat,
//           weight,
//           description: r.description || "",
//           image: mainUrl,
//           galleryImages: galleryUrls,
//           basePrice: base,
//           salePrice: sale,
//           profit: profitAmt,         // ✅
//           discount: base > sale ? base - sale : 0,
//           gstPercent: gst,
//           hsnCode,
//           taxType: r.taxType || "cgst_sgst",
//           status: r.status || "inactive",
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
const mongoose = require("mongoose");
const VendorProduct  = require("../models/vendorProduct");
const VendorCategory = require("../models/VendorCategory");
const cloudinary     = require("../utils/cloudinary");
const csv            = require("fast-csv");

const HsnCode =
  mongoose.models.HsnCode || require("../models/Hsncode");

/* ══════════════════════════════════════════════════════════════
   CLOUDINARY HELPERS
══════════════════════════════════════════════════════════════ */
const uploadToFolder = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

const uploadMain    = (buf) => uploadToFolder(buf, "price_images/main");
const uploadGallery = (buf) => uploadToFolder(buf, "price_images/gallery");

async function uploadManyGallery(files = [], limit = 4) {
  if (!files || !files.length) return [];
  return Promise.all(
    files.slice(0, limit).map((f) => uploadGallery(f.buffer))
  );
}

/* ══════════════════════════════════════════════════════════════
   GST + CESS CALCULATOR
   ✅ FIX: This is the single source of truth for salePrice.
   salePrice = (base + profit) + GST + CESS
   Never override this with a manually passed salePrice.
══════════════════════════════════════════════════════════════ */
function calcGstBreakdown(base, pl, gstPercent, cessPercent, taxType) {
  const priceExcludingGst = (Number(base) || 0) + (Number(pl) || 0);
  const gst  = Number(gstPercent)  || 0;
  const cess = Number(cessPercent) || 0;

  const gstAmount      = (priceExcludingGst * gst)  / 100;
  const cessAmount     = (priceExcludingGst * cess) / 100;
  const totalTaxAmount = gstAmount + cessAmount;
  const salePrice      = priceExcludingGst + totalTaxAmount;

  const isIgst = taxType === "igst";

  const cgstPercent = isIgst ? 0 : gst / 2;
  const sgstPercent = isIgst ? 0 : gst / 2;
  const igstPercent = isIgst ? gst : 0;
  const cgstAmount  = isIgst ? 0 : gstAmount / 2;
  const sgstAmount  = isIgst ? 0 : gstAmount / 2;
  const igstAmount  = isIgst ? gstAmount : 0;

  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    priceExcludingGst: r2(priceExcludingGst),
    gstAmount:         r2(gstAmount),
    cgstPercent:       r2(cgstPercent),
    sgstPercent:       r2(sgstPercent),
    igstPercent:       r2(igstPercent),
    cgstAmount:        r2(cgstAmount),
    sgstAmount:        r2(sgstAmount),
    igstAmount:        r2(igstAmount),
    cessAmount:        r2(cessAmount),
    totalTaxAmount:    r2(totalTaxAmount),
    salePrice:         r2(salePrice),
  };
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
   HSN MAP HELPER
══════════════════════════════════════════════════════════════ */
async function getHsnMap() {
  const all = await HsnCode.find({ active: true }).lean();
  return all.reduce((acc, h) => { acc[h.code.trim()] = h; return acc; }, {});
}

/* ══════════════════════════════════════════════════════════════
   buildProduct — shape returned to frontend
══════════════════════════════════════════════════════════════ */
function buildProduct(p, hsnMap = {}) {
  const hsnInfo = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
  return {
    _id:            p._id,
    vendor:         p.vendor,
    name:           p.name,
    brand:          p.brand           || "",
    category:       p.category,
    subcategory:    p.subcategory,
    subSubCategory: p.subSubCategory,
    weight:         p.weight          || { value: 1, unit: "kg" },
    description:    p.description     || "",
    image:          p.image           || "",
    galleryImages:  p.galleryImages   || [],
    basePrice:      p.basePrice,
    salePrice:      p.salePrice,
    profit:         p.profit          || 0,
    discount:       p.discount        || 0,
    gstPercent:     p.gstPercent      ?? 0,
    cessPercent:    p.cessPercent     ?? 0,
    hsnCode:        p.hsnCode         || "",
    taxType:        p.taxType         || "cgst_sgst",
    priceExcludingGst: p.priceExcludingGst ?? 0,
    gstAmount:         p.gstAmount         ?? 0,
    cgstPercent:       p.cgstPercent       ?? 0,
    sgstPercent:       p.sgstPercent       ?? 0,
    igstPercent:       p.igstPercent       ?? 0,
    cgstAmount:        p.cgstAmount        ?? 0,
    sgstAmount:        p.sgstAmount        ?? 0,
    igstAmount:        p.igstAmount        ?? 0,
    cessAmount:        p.cessAmount        ?? 0,
    totalTaxAmount:    p.totalTaxAmount    ?? 0,
    hsnDescription: hsnInfo?.description || "",
    hsnCategory:    hsnInfo?.category    || "",
    validTill:      p.validTill,
    status:         p.status,
    createdAt:      p.createdAt,
    updatedAt:      p.updatedAt,
  };
}

/* ══════════════════════════════════════════════════════════════
   HSN — GET ALL
══════════════════════════════════════════════════════════════ */
exports.getHsnCodes = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { active: true };
    if (category) query.category = new RegExp("^" + category + "$", "i");
    if (search) {
      const q = new RegExp(search, "i");
      query.$or = [{ code: q }, { description: q }, { category: q }];
    }
    const results    = await HsnCode.find(query).sort({ category: 1, code: 1 }).lean();
    const categories = await HsnCode.distinct("category", { active: true });
    const grouped    = results.reduce((acc, h) => {
      if (!acc[h.category]) acc[h.category] = [];
      acc[h.category].push(h);
      return acc;
    }, {});
    res.json({ success: true, total: results.length, data: results, grouped, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   HSN — SINGLE
══════════════════════════════════════════════════════════════ */
exports.getHsnByCode = async (req, res) => {
  try {
    const hsn = await HsnCode.findOne({ code: req.params.code.trim(), active: true }).lean();
    if (!hsn) return res.status(404).json({ success: false, message: "HSN not found" });
    res.json({ success: true, data: hsn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   HSN — CREATE
══════════════════════════════════════════════════════════════ */
exports.createHsnCode = async (req, res) => {
  try {
    const { code, description, category, gst } = req.body;
    if (!code || !description || !category || gst === undefined)
      return res.status(400).json({ success: false, message: "code, description, category & gst required" });
    const existing = await HsnCode.findOne({ code: code.trim() });
    if (existing) return res.status(409).json({ success: false, message: "HSN already exists" });
    const hsn = await HsnCode.create({
      code: code.trim(),
      description: description.trim(),
      category: category.trim(),
      gst: Number(gst),
    });
    res.status(201).json({ success: true, data: hsn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   CREATE PRODUCT
   ✅ FIX: salePrice is ALWAYS calculated from GST breakdown.
   Manual salePrice from frontend is completely ignored.
══════════════════════════════════════════════════════════════ */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, description, status,
      basePrice, profit,
      weight, subcategory, subSubCategory,
      gstPercent, cessPercent, hsnCode, taxType, validTill,
    } = req.body;

    const categoryDoc = await VendorCategory.findById(category);
    if (!categoryDoc) return res.status(400).json({ success: false, message: "Invalid category" });

    // Images
    const mainFile    = req.files?.mainImage?.[0];
    const mainUrl     = mainFile ? await uploadMain(mainFile.buffer) : "";
    const galleryUrls = await uploadManyGallery(req.files?.galleryImages || [], 4);

    // Weight
    let parsedWeight = { value: 1, unit: "kg" };
    if (weight) {
      parsedWeight = parseJSON(weight, parsedWeight);
      if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
      if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit)) parsedWeight.unit = "kg";
    }

    const base      = Number(basePrice) || 0;
    const profitAmt = Number(profit) || 0;

    // HSN → resolve GST & CESS
    const hsnEntry = hsnCode
      ? await HsnCode.findOne({ code: hsnCode.trim(), active: true }).lean()
      : null;

    const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? 0);
    const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? 0);
    const tax  = taxType || "cgst_sgst";

    // ✅ salePrice is ALWAYS from breakdown — no manual override
    const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

    const product = await VendorProduct.create({
      vendor:    req.vendor.id,
      name,
      brand:     brand || "",
      category:  categoryDoc._id,
      subcategory:    parseSub(subcategory)    || { id: null, name: null, image: null },
      subSubCategory: parseSubSub(subSubCategory) || { id: null, name: null, image: null },
      weight:    parsedWeight,
      description: description || "",
      image:     mainUrl,
      galleryImages: galleryUrls,

      basePrice:  base,
      profit:     profitAmt,
      salePrice:  breakdown.salePrice,          // ✅ always GST-inclusive
      discount:   base > breakdown.salePrice ? base - breakdown.salePrice : 0,

      gstPercent:  gst,
      cessPercent: cess,
      hsnCode:     hsnCode || "",
      taxType:     tax,

      priceExcludingGst: breakdown.priceExcludingGst,
      gstAmount:         breakdown.gstAmount,
      cgstPercent:       breakdown.cgstPercent,
      sgstPercent:       breakdown.sgstPercent,
      igstPercent:       breakdown.igstPercent,
      cgstAmount:        breakdown.cgstAmount,
      sgstAmount:        breakdown.sgstAmount,
      igstAmount:        breakdown.igstAmount,
      cessAmount:        breakdown.cessAmount,
      totalTaxAmount:    breakdown.totalTaxAmount,

      validTill: validTill || undefined,
      status:    status || "inactive",
    });

    const hsnMap = await getHsnMap();
    res.status(201).json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   GET MY PRODUCTS
══════════════════════════════════════════════════════════════ */
exports.getMyProducts = async (req, res) => {
  try {
    const products = await VendorProduct.find({ vendor: req.vendor.id })
      .populate("category", "name image subcategories")
      .sort({ createdAt: -1 })
      .lean();
    const hsnMap = await getHsnMap();
    res.json({ success: true, data: products.map((p) => buildProduct(p, hsnMap)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   GET PRODUCTS TREE
══════════════════════════════════════════════════════════════ */
exports.getVendorProductsTree = async (req, res) => {
  try {
    const vendorId   = req.vendor.id;
    const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
    const products   = await VendorProduct.find({ vendor: vendorId }).lean();

    const data = categories.map((cat) => ({
      _id:  cat._id,
      name: cat.name,
      image: cat.image,
      subcategories: (cat.subcategories || []).filter((s) => s.active).map((sub) => ({
        _id:  sub._id,
        name: sub.name,
        image: sub.image,
        subSubCategories: (sub.subSubCategories || []).filter((ss) => ss.active).map((ss) => ({
          _id:      ss._id,
          name:     ss.name,
          image:    ss.image,
          products: products.filter((p) =>
            String(p.category) === String(cat._id) &&
            p.subcategory?.id  === String(sub._id) &&
            p.subSubCategory?.id === String(ss._id)
          ),
        })),
        products: products.filter((p) =>
          String(p.category) === String(cat._id) &&
          p.subcategory?.id  === String(sub._id) &&
          !p.subSubCategory?.id
        ),
      })),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   UPDATE PRODUCT
   ✅ FIX: salePrice is ALWAYS recalculated from GST breakdown.
══════════════════════════════════════════════════════════════ */
exports.updateProduct = async (req, res) => {
  try {
    const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, brand, description, status, category,
      weight, subcategory, subSubCategory,
      basePrice, profit,
      gstPercent, cessPercent, hsnCode, taxType, validTill,
    } = req.body;

    // ── Images ──
    const mainFile = req.files?.mainImage?.[0];
    if (mainFile) {
      product.image = await uploadMain(mainFile.buffer);
    } else if (req.body.existingMainImage !== undefined) {
      product.image = req.body.existingMainImage;
    }

    let existingGallery = [];
    try { existingGallery = JSON.parse(req.body.existingGalleryImages || "[]"); } catch {}
    const slotsLeft  = Math.max(0, 4 - existingGallery.length);
    const newGallery = await uploadManyGallery(req.files?.galleryImages || [], slotsLeft);
    product.galleryImages = [...existingGallery, ...newGallery].slice(0, 4);

    // ── Basic fields ──
    if (name        !== undefined) product.name        = name;
    if (brand       !== undefined) product.brand       = brand;
    if (description !== undefined) product.description = description;
    if (status      !== undefined) product.status      = status;
    if (category    !== undefined) product.category    = category;
    if (validTill   !== undefined) product.validTill   = validTill || undefined;
    if (subcategory    !== undefined) product.subcategory    = parseSub(subcategory)    || { id: null, name: null, image: null };
    if (subSubCategory !== undefined) product.subSubCategory = parseSubSub(subSubCategory) || { id: null, name: null, image: null };

    // ── Weight ──
    if (weight !== undefined) {
      const w = parseJSON(weight);
      if (w) {
        if (w.unit === "g") w.unit = "gm";
        product.weight = w;
      }
    }

    // ── Pricing ──
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (profit    !== undefined && profit !== "") product.profit = Number(profit);

    // ── HSN → resolve GST & CESS ──
    const resolvedHsn = hsnCode !== undefined ? hsnCode : product.hsnCode;
    product.hsnCode   = resolvedHsn || "";

    const hsnEntry = resolvedHsn
      ? await HsnCode.findOne({ code: resolvedHsn.trim(), active: true }).lean()
      : null;

    const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? Number(product.gstPercent  || 0));
    const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? Number(product.cessPercent || 0));

    product.gstPercent  = gst;
    product.cessPercent = cess;
    product.taxType     = taxType || product.taxType || "cgst_sgst";

    // ✅ salePrice is ALWAYS recalculated — no manual override
    const breakdown = calcGstBreakdown(
      Number(product.basePrice),
      Number(product.profit || 0),
      gst, cess,
      product.taxType
    );

    product.salePrice         = breakdown.salePrice;           // ✅ always GST-inclusive
    product.discount          = product.basePrice > breakdown.salePrice ? product.basePrice - breakdown.salePrice : 0;
    product.priceExcludingGst = breakdown.priceExcludingGst;
    product.gstAmount         = breakdown.gstAmount;
    product.cgstPercent       = breakdown.cgstPercent;
    product.sgstPercent       = breakdown.sgstPercent;
    product.igstPercent       = breakdown.igstPercent;
    product.cgstAmount        = breakdown.cgstAmount;
    product.sgstAmount        = breakdown.sgstAmount;
    product.igstAmount        = breakdown.igstAmount;
    product.cessAmount        = breakdown.cessAmount;
    product.totalTaxAmount    = breakdown.totalTaxAmount;

    await product.save();
    const hsnMap = await getHsnMap();
    res.json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   UPDATE STATUS
══════════════════════════════════════════════════════════════ */
exports.updateStatus = async (req, res) => {
  try {
    const updated = await VendorProduct.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor.id },
      { status: req.body.status },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    const hsnMap = await getHsnMap();
    res.json({ success: true, data: buildProduct(updated, hsnMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   COPY PRODUCT
   ✅ FIX: Recalculate breakdown on copy instead of copying old values.
══════════════════════════════════════════════════════════════ */
exports.copyProduct = async (req, res) => {
  try {
    const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Product not found" });

    // ✅ Always recalculate on copy
    const breakdown = calcGstBreakdown(
      Number(item.basePrice),
      Number(item.profit || 0),
      Number(item.gstPercent  || 0),
      Number(item.cessPercent || 0),
      item.taxType || "cgst_sgst"
    );

    const newItem = await VendorProduct.create({
      vendor:         req.vendor.id,
      name:           item.name + " (Copy)",
      brand:          item.brand          || "",
      category:       item.category,
      subcategory:    item.subcategory,
      subSubCategory: item.subSubCategory,
      weight:         item.weight,
      description:    item.description,
      image:          item.image          || "",
      galleryImages:  item.galleryImages  ? [...item.galleryImages] : [],

      basePrice:   item.basePrice,
      profit:      item.profit     || 0,
      salePrice:   breakdown.salePrice,           // ✅ recalculated
      discount:    item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0,

      gstPercent:  item.gstPercent  || 0,
      cessPercent: item.cessPercent || 0,
      hsnCode:     item.hsnCode     || "",
      taxType:     item.taxType     || "cgst_sgst",

      priceExcludingGst: breakdown.priceExcludingGst,
      gstAmount:         breakdown.gstAmount,
      cgstPercent:       breakdown.cgstPercent,
      sgstPercent:       breakdown.sgstPercent,
      igstPercent:       breakdown.igstPercent,
      cgstAmount:        breakdown.cgstAmount,
      sgstAmount:        breakdown.sgstAmount,
      igstAmount:        breakdown.igstAmount,
      cessAmount:        breakdown.cessAmount,
      totalTaxAmount:    breakdown.totalTaxAmount,

      validTill: item.validTill,
      status:    "inactive",
    });

    const hsnMap = await getHsnMap();
    res.json({ success: true, data: buildProduct(newItem.toObject(), hsnMap) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   DELETE PRODUCT
══════════════════════════════════════════════════════════════ */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await VendorProduct.deleteOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!deleted.deletedCount) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   DELETE SELECTED
══════════════════════════════════════════════════════════════ */
exports.deleteSelected = async (req, res) => {
  try {
    await VendorProduct.deleteMany({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   BULK UPDATE
   ✅ FIX: salePrice always recalculated from GST breakdown.
══════════════════════════════════════════════════════════════ */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const hsnMap = await getHsnMap();
    const updated = [];

    for (const p of req.body.products) {
      const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
      if (!item) continue;

      if (p.basePrice   !== undefined) item.basePrice   = Number(p.basePrice);
      if (p.profit      !== undefined) item.profit      = Number(p.profit);
      if (p.gstPercent  !== undefined) item.gstPercent  = Number(p.gstPercent);
      if (p.cessPercent !== undefined) item.cessPercent = Number(p.cessPercent);
      if (p.hsnCode     !== undefined) item.hsnCode     = p.hsnCode;
      if (p.taxType     !== undefined) item.taxType     = p.taxType;
      if (p.brand       !== undefined) item.brand       = p.brand;
      if (p.status      !== undefined) item.status      = p.status;

      // ✅ Always recalculate — ignore any salePrice sent from client
      const breakdown = calcGstBreakdown(
        Number(item.basePrice),
        Number(item.profit      || 0),
        Number(item.gstPercent  || 0),
        Number(item.cessPercent || 0),
        item.taxType || "cgst_sgst"
      );

      item.salePrice         = breakdown.salePrice;           // ✅ always GST-inclusive
      item.discount          = item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0;
      item.priceExcludingGst = breakdown.priceExcludingGst;
      item.gstAmount         = breakdown.gstAmount;
      item.cgstPercent       = breakdown.cgstPercent;
      item.sgstPercent       = breakdown.sgstPercent;
      item.igstPercent       = breakdown.igstPercent;
      item.cgstAmount        = breakdown.cgstAmount;
      item.sgstAmount        = breakdown.sgstAmount;
      item.igstAmount        = breakdown.igstAmount;
      item.cessAmount        = breakdown.cessAmount;
      item.totalTaxAmount    = breakdown.totalTaxAmount;

      await item.save();
      updated.push(buildProduct(item.toObject(), hsnMap));
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error("bulkUpdateProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   EXPORT ALL
══════════════════════════════════════════════════════════════ */
exports.exportProducts = async (req, res) => {
  try {
    const data   = await VendorProduct.find({ vendor: req.vendor.id }).populate("category", "name").lean();
    const hsnMap = await getHsnMap();

    res.setHeader("Content-Disposition", "attachment; filename=vendor_products.csv");
    res.setHeader("Content-Type", "text/csv");

    const stream = csv.format({ headers: true });
    stream.pipe(res);

    for (const p of data) {
      const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
      stream.write({
        id:                p._id,
        name:              p.name,
        brand:             p.brand             || "",
        category:          p.category?.name    || "",
        subcategory:       p.subcategory?.name || "",
        subSubCategory:    p.subSubCategory?.name || "",
        image:             p.image             || "",
        galleryImages:     (p.galleryImages || []).join("|"),
        weight:            JSON.stringify(p.weight),
        description:       p.description       || "",
        basePrice:         p.basePrice,
        profit:            p.profit            || 0,
        salePrice:         p.salePrice,
        discount:          p.discount          || 0,
        gstPercent:        p.gstPercent        || 0,
        cessPercent:       p.cessPercent       || 0,
        hsnCode:           p.hsnCode           || "",
        hsnDescription:    h?.description      || "",
        taxType:           p.taxType           || "cgst_sgst",
        priceExcludingGst: p.priceExcludingGst || 0,
        gstAmount:         p.gstAmount         || 0,
        cgstPercent:       p.cgstPercent       || 0,
        sgstPercent:       p.sgstPercent       || 0,
        igstPercent:       p.igstPercent       || 0,
        cgstAmount:        p.cgstAmount        || 0,
        sgstAmount:        p.sgstAmount        || 0,
        igstAmount:        p.igstAmount        || 0,
        cessAmount:        p.cessAmount        || 0,
        totalTaxAmount:    p.totalTaxAmount    || 0,
        status:            p.status,
      });
    }
    stream.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   EXPORT SELECTED
══════════════════════════════════════════════════════════════ */
exports.exportSelected = async (req, res) => {
  try {
    const data   = await VendorProduct.find({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id }).populate("category", "name").lean();
    const hsnMap = await getHsnMap();

    res.setHeader("Content-Disposition", "attachment; filename=selected_vendor_products.csv");
    res.setHeader("Content-Type", "text/csv");

    const stream = csv.format({ headers: true });
    stream.pipe(res);

    for (const p of data) {
      const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
      stream.write({
        id:                p._id,
        name:              p.name,
        brand:             p.brand             || "",
        category:          p.category?.name    || "",
        subcategory:       p.subcategory?.name || "",
        subSubCategory:    p.subSubCategory?.name || "",
        image:             p.image             || "",
        galleryImages:     (p.galleryImages || []).join("|"),
        weight:            JSON.stringify(p.weight),
        description:       p.description       || "",
        basePrice:         p.basePrice,
        profit:            p.profit            || 0,
        salePrice:         p.salePrice,
        discount:          p.discount          || 0,
        gstPercent:        p.gstPercent        || 0,
        cessPercent:       p.cessPercent       || 0,
        hsnCode:           p.hsnCode           || "",
        hsnDescription:    h?.description      || "",
        taxType:           p.taxType           || "cgst_sgst",
        priceExcludingGst: p.priceExcludingGst || 0,
        gstAmount:         p.gstAmount         || 0,
        cgstPercent:       p.cgstPercent       || 0,
        sgstPercent:       p.sgstPercent       || 0,
        igstPercent:       p.igstPercent       || 0,
        cgstAmount:        p.cgstAmount        || 0,
        sgstAmount:        p.sgstAmount        || 0,
        igstAmount:        p.igstAmount        || 0,
        cessAmount:        p.cessAmount        || 0,
        totalTaxAmount:    p.totalTaxAmount    || 0,
        status:            p.status,
      });
    }
    stream.end();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   IMPORT CSV
   ✅ FIX: salePrice always from breakdown, never from CSV column.
══════════════════════════════════════════════════════════════ */
exports.importProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "CSV file required" });

    const rows = [];
    await new Promise((resolve, reject) => {
      csv.parseString(req.file.buffer.toString("utf-8"), { headers: true })
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const hsnMap = await getHsnMap();
    let imported = 0;

    for (const r of rows) {
      try {
        const base      = Number(r.basePrice || 0);
        const hsnCode   = r.hsnCode || "";
        const hsnEntry  = hsnCode ? hsnMap[hsnCode.trim()] || null : null;
        const gst       = r.gstPercent  ? Number(r.gstPercent)  : (hsnEntry?.gst  ?? 0);
        const cess      = r.cessPercent ? Number(r.cessPercent) : (hsnEntry?.cess ?? 0);
        const profitAmt = r.profit ? Number(r.profit) : 0;
        const tax       = r.taxType || "cgst_sgst";

        // ✅ Always recalculate — ignore salePrice from CSV
        const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

        let weight = { value: 1, unit: "kg" };
        try { weight = JSON.parse(r.weight); } catch {}
        if (weight.unit === "g") weight.unit = "gm";

        const cat = await VendorCategory.findOne({ name: r.category?.trim() });
        if (!cat) { console.log("Category not found:", r.category); continue; }

        let subCat    = { id: null, name: null, image: null };
        let subSubCat = { id: null, name: null, image: null };
        if (r.subcategory) {
          const sub = cat.subcategories?.find((s) => s.name.toLowerCase() === r.subcategory.trim().toLowerCase());
          if (sub) {
            subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
            if (r.subSubCategory) {
              const ss = sub.subSubCategories?.find((x) => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase());
              if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
            }
          }
        }

        const mainUrl     = r.image?.startsWith("http") ? r.image.trim() : "";
        const galleryUrls = r.galleryImages
          ? r.galleryImages.split("|").map((u) => u.trim()).filter((u) => u.startsWith("http")).slice(0, 4)
          : [];

        await VendorProduct.create({
          vendor:         req.vendor.id,
          name:           r.name,
          brand:          r.brand || "",
          category:       cat._id,
          subcategory:    subCat,
          subSubCategory: subSubCat,
          weight,
          description:    r.description || "",
          image:          mainUrl,
          galleryImages:  galleryUrls,
          basePrice:      base,
          profit:         profitAmt,
          salePrice:      breakdown.salePrice,      // ✅ always GST-inclusive
          discount:       base > breakdown.salePrice ? base - breakdown.salePrice : 0,
          gstPercent:     gst,
          cessPercent:    cess,
          hsnCode,
          taxType:        tax,
          priceExcludingGst: breakdown.priceExcludingGst,
          gstAmount:         breakdown.gstAmount,
          cgstPercent:       breakdown.cgstPercent,
          sgstPercent:       breakdown.sgstPercent,
          igstPercent:       breakdown.igstPercent,
          cgstAmount:        breakdown.cgstAmount,
          sgstAmount:        breakdown.sgstAmount,
          igstAmount:        breakdown.igstAmount,
          cessAmount:        breakdown.cessAmount,
          totalTaxAmount:    breakdown.totalTaxAmount,
          status: r.status || "inactive",
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

/* ══════════════════════════════════════════════════════════════
   FIX EXISTING PRODUCTS (one-time migration utility)
   POST /api/vendor/products/fix-prices
   ✅ Recalculates salePrice for ALL existing products with correct GST.
══════════════════════════════════════════════════════════════ */
exports.fixAllProductPrices = async (req, res) => {
  try {
    const products = await VendorProduct.find({ vendor: req.vendor.id });
    let fixed = 0;

    for (const p of products) {
      const breakdown = calcGstBreakdown(
        Number(p.basePrice),
        Number(p.profit      || 0),
        Number(p.gstPercent  || 0),
        Number(p.cessPercent || 0),
        p.taxType || "cgst_sgst"
      );

      p.salePrice         = breakdown.salePrice;
      p.discount          = p.basePrice > breakdown.salePrice ? p.basePrice - breakdown.salePrice : 0;
      p.priceExcludingGst = breakdown.priceExcludingGst;
      p.gstAmount         = breakdown.gstAmount;
      p.cgstPercent       = breakdown.cgstPercent;
      p.sgstPercent       = breakdown.sgstPercent;
      p.igstPercent       = breakdown.igstPercent;
      p.cgstAmount        = breakdown.cgstAmount;
      p.sgstAmount        = breakdown.sgstAmount;
      p.igstAmount        = breakdown.igstAmount;
      p.cessAmount        = breakdown.cessAmount;
      p.totalTaxAmount    = breakdown.totalTaxAmount;

      await p.save();
      fixed++;
    }

    res.json({ success: true, message: `${fixed} products recalculated with correct GST-inclusive sale price.` });
  } catch (err) {
    console.error("fixAllProductPrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};