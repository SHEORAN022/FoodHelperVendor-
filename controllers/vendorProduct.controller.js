// // const mongoose = require("mongoose");
// // const VendorProduct  = require("../models/vendorProduct");
// // const VendorCategory = require("../models/VendorCategory");
// // const Brand          = require("../models/brandModel");
// // const cloudinary     = require("../utils/cloudinary");
// // const csv            = require("fast-csv");

// // const HsnCode =
// //   mongoose.models.HsnCode || require("../models/Hsncode");


// // const uploadToFolder = (buffer, folder) =>
// //   new Promise((resolve, reject) => {
// //     cloudinary.uploader
// //       .upload_stream({ folder }, (err, result) => {
// //         if (err) reject(err);
// //         else resolve(result.secure_url);
// //       })
// //       .end(buffer);
// //   });

// // const uploadMain    = (buf) => uploadToFolder(buf, "price_images/main");
// // const uploadGallery = (buf) => uploadToFolder(buf, "price_images/gallery");

// // async function uploadManyGallery(files = [], limit = 4) {
// //   if (!files || !files.length) return [];
// //   return Promise.all(
// //     files.slice(0, limit).map((f) => uploadGallery(f.buffer))
// //   );
// // }

// // function calcGstBreakdown(base, profit, gstPercent, cessPercent, taxType) {
// //   const basePrice   = Number(base)   || 0;
// //   const profitPrice = Number(profit) || 0;

// //   const salePrice = basePrice + profitPrice;

// //   const gst  = Number(gstPercent)  || 0;
// //   const cess = Number(cessPercent) || 0;

// //   const gstAmount      = (salePrice * gst)  / (100 + gst);
// //   const cessAmount     = (salePrice * cess) / (100 + cess);
// //   const totalTaxAmount = gstAmount + cessAmount;
// //   const priceExcludingGst = salePrice - totalTaxAmount;

// //   const isIgst = taxType === "igst";

// //   const cgstPercent = isIgst ? 0 : gst / 2;
// //   const sgstPercent = isIgst ? 0 : gst / 2;
// //   const igstPercent = isIgst ? gst : 0;

// //   const cgstAmount = isIgst ? 0 : gstAmount / 2;
// //   const sgstAmount = isIgst ? 0 : gstAmount / 2;
// //   const igstAmount = isIgst ? gstAmount : 0;

// //   const r2 = (n) => Math.round(n * 100) / 100;

// //   return {
// //     salePrice:          r2(salePrice),
// //     priceExcludingGst:  r2(priceExcludingGst),
// //     gstAmount:          r2(gstAmount),
// //     cessAmount:         r2(cessAmount),
// //     totalTaxAmount:     r2(totalTaxAmount),
// //     cgstPercent:        r2(cgstPercent),
// //     sgstPercent:        r2(sgstPercent),
// //     igstPercent:        r2(igstPercent),
// //     cgstAmount:         r2(cgstAmount),
// //     sgstAmount:         r2(sgstAmount),
// //     igstAmount:         r2(igstAmount),
// //   };
// // }

// // /* ══════════════════════════════════════════════════════════════
// //    PARSE HELPERS
// // ══════════════════════════════════════════════════════════════ */
// // const parseJSON = (str, fallback = null) => {
// //   try { return JSON.parse(str); } catch { return fallback; }
// // };

// // function parseSub(raw) {
// //   if (!raw || raw === "null" || raw === "") return null;
// //   try {
// //     const s = JSON.parse(raw);
// //     if (!s || !s.id) return null;
// //     return { id: s.id, name: s.name || "", image: s.image || "" };
// //   } catch { return null; }
// // }

// // function parseSubSub(raw) {
// //   if (!raw || raw === "null" || raw === "") return null;
// //   try {
// //     const s = JSON.parse(raw);
// //     if (!s || !s.id) return null;
// //     return { id: s.id, name: s.name || "", image: s.image || "" };
// //   } catch { return null; }
// // }

// // /* ══════════════════════════════════════════════════════════════
// //    PARSE unitConversions from request body
// //    Accepts string (JSON) or array
// //    Each entry: { unit: "Dozen", nPcs: 12 }
// // ══════════════════════════════════════════════════════════════ */
// // function parseUnitConversions(raw) {
// //   if (!raw) return [];
// //   let arr = raw;
// //   if (typeof raw === "string") {
// //     try { arr = JSON.parse(raw); } catch { return []; }
// //   }
// //   if (!Array.isArray(arr)) return [];
// //   return arr
// //     .filter((u) => u && u.unit && Number(u.nPcs) > 0)
// //     .map((u) => ({ unit: String(u.unit).trim(), nPcs: Number(u.nPcs) }));
// // }

// // /* ══════════════════════════════════════════════════════════════
// //    PARSE packaging from request body
// // ══════════════════════════════════════════════════════════════ */
// // function parsePackaging(raw) {
// //   const def = { box: 0, packetPerBox: 0, piecePerPacket: 0 };
// //   if (!raw) return def;
// //   let obj = raw;
// //   if (typeof raw === "string") {
// //     try { obj = JSON.parse(raw); } catch { return def; }
// //   }
// //   return {
// //     box:            Number(obj.box)            || 0,
// //     packetPerBox:   Number(obj.packetPerBox)   || 0,
// //     piecePerPacket: Number(obj.piecePerPacket) || 0,
// //   };
// // }


// // async function getHsnMap() {
// //   const all = await HsnCode.find({ active: true }).lean();
// //   return all.reduce((acc, h) => { acc[h.code.trim()] = h; return acc; }, {});
// // }


// // function buildProduct(p, hsnMap = {}) {
// //   const hsnInfo = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
// //   return {
// //     _id:               p._id,
// //     vendor:            p.vendor,
// //     name:              p.name,
// //     brand:             p.brand || null,
// //     category:          p.category,
// //     subcategory:       p.subcategory,
// //     subSubCategory:    p.subSubCategory,
// //     weight:            p.weight || null,
// //     unitConversions:   p.unitConversions  || [],
// //     unitDefs: (p.unitConversions || []).map((u) => ({ label: u.unit, multiplier: u.nPcs, })),
// //     packaging:         p.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
// //     description:       p.description     || "",
// //     image:             p.image           || "",
// //     galleryImages:     p.galleryImages   || [],
// //     basePrice:         p.basePrice,
// //     salePrice:         p.salePrice,
// //     profit:            p.profit          || 0,
// //     discount:          p.discount        || 0,
// //     gstPercent:        p.gstPercent      ?? 0,
// //     cessPercent:       p.cessPercent     ?? 0,
// //     hsnCode:           p.hsnCode         || "",
// //     taxType:           p.taxType         || "cgst_sgst",
// //     priceExcludingGst: p.priceExcludingGst ?? 0,
// //     gstAmount:         p.gstAmount         ?? 0,
// //     cgstPercent:       p.cgstPercent       ?? 0,
// //     sgstPercent:       p.sgstPercent       ?? 0,
// //     igstPercent:       p.igstPercent       ?? 0,
// //     cgstAmount:        p.cgstAmount        ?? 0,
// //     sgstAmount:        p.sgstAmount        ?? 0,
// //     igstAmount:        p.igstAmount        ?? 0,
// //     cessAmount:        p.cessAmount        ?? 0,
// //     totalTaxAmount:    p.totalTaxAmount    ?? 0,
// //     hsnDescription:    hsnInfo?.description || "",
// //     hsnCategory:       hsnInfo?.category    || "",
// //     validTill:         p.validTill,
// //     status:            p.status,
// //     createdAt:         p.createdAt,
// //     updatedAt:         p.updatedAt,
// //   };
// // }

// // /* ══════════════════════════════════════════════════════════════
// //    HSN — GET ALL
// // ══════════════════════════════════════════════════════════════ */
// // exports.getHsnCodes = async (req, res) => {
// //   try {
// //     const { search, category } = req.query;
// //     const query = { active: true };
// //     if (category) query.category = new RegExp("^" + category + "$", "i");
// //     if (search) {
// //       const q = new RegExp(search, "i");
// //       query.$or = [{ code: q }, { description: q }, { category: q }];
// //     }
// //     const results    = await HsnCode.find(query).sort({ category: 1, code: 1 }).lean();
// //     const categories = await HsnCode.distinct("category", { active: true });
// //     const grouped    = results.reduce((acc, h) => {
// //       if (!acc[h.category]) acc[h.category] = [];
// //       acc[h.category].push(h);
// //       return acc;
// //     }, {});
// //     res.json({ success: true, total: results.length, data: results, grouped, categories });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    HSN — SINGLE
// // ══════════════════════════════════════════════════════════════ */
// // exports.getHsnByCode = async (req, res) => {
// //   try {
// //     const hsn = await HsnCode.findOne({ code: req.params.code.trim(), active: true }).lean();
// //     if (!hsn) return res.status(404).json({ success: false, message: "HSN not found" });
// //     res.json({ success: true, data: hsn });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    HSN — CREATE
// // ══════════════════════════════════════════════════════════════ */
// // exports.createHsnCode = async (req, res) => {
// //   try {
// //     const { code, description, category, gst, cess } = req.body;
// //     if (!code || !description || !category || gst === undefined)
// //       return res.status(400).json({ success: false, message: "code, description, category & gst required" });
// //     const existing = await HsnCode.findOne({ code: code.trim() });
// //     if (existing) return res.status(409).json({ success: false, message: "HSN already exists" });
// //     const hsn = await HsnCode.create({
// //       code:        code.trim(),
// //       description: description.trim(),
// //       category:    category.trim(),
// //       gst:         Number(gst),
// //       cess:        Number(cess) || 0,
// //     });
// //     res.status(201).json({ success: true, data: hsn });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    CREATE PRODUCT
// //    salePrice is ALWAYS calculated from GST breakdown — never manual
// // ══════════════════════════════════════════════════════════════ */
// // exports.createProduct = async (req, res) => {
// //   try {
// //     const {
// //       name, brand, category, description, status,
// //       basePrice, profit,
// //       weight, unitConversions, packaging,
// //       subcategory, subSubCategory,
// //       gstPercent, cessPercent, hsnCode, taxType, validTill,
// //     } = req.body;

// //     const categoryDoc = await VendorCategory.findById(category);
// //     if (!categoryDoc)
// //       return res.status(400).json({ success: false, message: "Invalid category" });

// //     const brandDoc = await Brand.findById(brand);
// //     if (!brandDoc)
// //       return res.status(400).json({ success: false, message: "Invalid brand" });

// //     /* Images */
// //     const mainFile    = req.files?.mainImage?.[0];
// //     const mainUrl     = mainFile ? await uploadMain(mainFile.buffer) : "";
// //     const galleryUrls = await uploadManyGallery(req.files?.galleryImages || [], 4);

// //     /* Weight — optional, null if not provided */
// //     let parsedWeight = null;
// //     if (weight) {
// //       parsedWeight = parseJSON(weight, null);
// //       if (parsedWeight) {
// //         if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
// //         if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit))
// //           parsedWeight.unit = "kg";
// //         if (!parsedWeight.value || parsedWeight.value <= 0) parsedWeight = null;
// //       }
// //     }

// //     const base      = Number(basePrice) || 0;
// //     const profitAmt = Number(profit)    || 0;

// //     /* HSN → resolve GST & CESS */
// //     const hsnEntry = hsnCode
// //       ? await HsnCode.findOne({ code: hsnCode.trim(), active: true }).lean()
// //       : null;

// //     const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? 0);
// //     const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? 0);
// //     const tax  = taxType || "cgst_sgst";

// //     const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

// //     const product = await VendorProduct.create({
// //       vendor:         req.vendor.id,
// //       name,
// //       brand:          brandDoc._id,
// //       category:       categoryDoc._id,
// //       subcategory:    parseSub(subcategory)       || { id: null, name: null, image: null },
// //       subSubCategory: parseSubSub(subSubCategory) || { id: null, name: null, image: null },
// //       weight:         parsedWeight,
// //       unitConversions: parseUnitConversions(unitConversions),
// //       packaging:      parsePackaging(packaging),
// //       description:    description || "",
// //       image:          mainUrl,
// //       galleryImages:  galleryUrls,

// //       basePrice:  base,
// //       profit:     profitAmt,
// //       salePrice:  breakdown.salePrice,
// //       discount:   base > breakdown.salePrice ? base - breakdown.salePrice : 0,

// //       gstPercent:  gst,
// //       cessPercent: cess,
// //       hsnCode:     hsnCode || "",
// //       taxType:     tax,

// //       priceExcludingGst: breakdown.priceExcludingGst,
// //       gstAmount:         breakdown.gstAmount,
// //       cgstPercent:       breakdown.cgstPercent,
// //       sgstPercent:       breakdown.sgstPercent,
// //       igstPercent:       breakdown.igstPercent,
// //       cgstAmount:        breakdown.cgstAmount,
// //       sgstAmount:        breakdown.sgstAmount,
// //       igstAmount:        breakdown.igstAmount,
// //       cessAmount:        breakdown.cessAmount,
// //       totalTaxAmount:    breakdown.totalTaxAmount,

// //       validTill: validTill || undefined,
// //       status:    status    || "inactive",
// //     });

// //     const hsnMap = await getHsnMap();
// //     res.status(201).json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
// //   } catch (err) {
// //     console.error("createProduct error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    GET MY PRODUCTS
// // ══════════════════════════════════════════════════════════════ */
// // exports.getMyProducts = async (req, res) => {
// //   try {
// //     const products = await VendorProduct.find({ vendor: req.vendor.id })
// //       .populate("category", "name image subcategories")
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     /* populate only valid brand ObjectIds */
// //     const validProducts = products.filter(
// //       (p) => p.brand && mongoose.Types.ObjectId.isValid(p.brand)
// //     );

// //     const populatedProducts = await Brand.populate(validProducts, {
// //       path:   "brand",
// //       select: "name image",
// //     });

// //     const hsnMap = await getHsnMap();

// //     res.json({
// //       success: true,
// //       data: populatedProducts.map((p) => buildProduct(p, hsnMap)),
// //     });
// //   } catch (err) {
// //     console.error("getMyProducts error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    GET PRODUCTS TREE
// // ══════════════════════════════════════════════════════════════ */
// // exports.getVendorProductsTree = async (req, res) => {
// //   try {
// //     const vendorId   = req.vendor.id;
// //     const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
// //     const products   = await VendorProduct.find({ vendor: vendorId }).lean();

// //     const data = categories.map((cat) => ({
// //       _id:  cat._id,
// //       name: cat.name,
// //       image: cat.image,
// //       subcategories: (cat.subcategories || []).filter((s) => s.active).map((sub) => ({
// //         _id:  sub._id,
// //         name: sub.name,
// //         image: sub.image,
// //         subSubCategories: (sub.subSubCategories || []).filter((ss) => ss.active).map((ss) => ({
// //           _id:      ss._id,
// //           name:     ss.name,
// //           image:    ss.image,
// //           products: products.filter((p) =>
// //             String(p.category) === String(cat._id) &&
// //             p.subcategory?.id  === String(sub._id) &&
// //             p.subSubCategory?.id === String(ss._id)
// //           ),
// //         })),
// //         products: products.filter((p) =>
// //           String(p.category) === String(cat._id) &&
// //           p.subcategory?.id  === String(sub._id) &&
// //           !p.subSubCategory?.id
// //         ),
// //       })),
// //     }));

// //     res.json({ success: true, data });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    UPDATE PRODUCT
// //    salePrice is ALWAYS recalculated — never manual override
// // ══════════════════════════════════════════════════════════════ */
// // exports.updateProduct = async (req, res) => {
// //   try {
// //     const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
// //     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

// //     const {
// //       name, brand, description, status, category,
// //       weight, unitConversions, packaging,
// //       subcategory, subSubCategory,
// //       basePrice, profit,
// //       gstPercent, cessPercent, hsnCode, taxType, validTill,
// //     } = req.body;

// //     /* Images */
// //     const mainFile = req.files?.mainImage?.[0];
// //     if (mainFile) {
// //       product.image = await uploadMain(mainFile.buffer);
// //     } else if (req.body.existingMainImage !== undefined) {
// //       product.image = req.body.existingMainImage;
// //     }

// //     let existingGallery = [];
// //     try { existingGallery = JSON.parse(req.body.existingGalleryImages || "[]"); } catch {}
// //     const slotsLeft  = Math.max(0, 4 - existingGallery.length);
// //     const newGallery = await uploadManyGallery(req.files?.galleryImages || [], slotsLeft);
// //     product.galleryImages = [...existingGallery, ...newGallery].slice(0, 4);

// //     /* Basic fields */
// //     if (name        !== undefined) product.name        = name;
// //     if (brand       !== undefined) product.brand       = brand;
// //     if (description !== undefined) product.description = description;
// //     if (status      !== undefined) product.status      = status;
// //     if (category    !== undefined) product.category    = category;
// //     if (validTill   !== undefined) product.validTill   = validTill || undefined;

// //     if (subcategory    !== undefined)
// //       product.subcategory    = parseSub(subcategory)       || { id: null, name: null, image: null };
// //     if (subSubCategory !== undefined)
// //       product.subSubCategory = parseSubSub(subSubCategory) || { id: null, name: null, image: null };

// //     /* Weight — optional, only set if value provided and valid */
// //     if (weight !== undefined) {
// //       const w = parseJSON(weight, null);
// //       if (w && w.value && Number(w.value) > 0) {
// //         if (w.unit === "g") w.unit = "gm";
// //         if (!["kg", "gm", "ltr", "ml", "pcs"].includes(w.unit)) w.unit = "kg";
// //         product.weight = w;
// //       } else {
// //         /* empty string or zero value means "clear weight" */
// //         product.weight = null;
// //       }
// //     }

// //     /* unitConversions */
// //     if (unitConversions !== undefined)
// //       product.unitConversions = parseUnitConversions(unitConversions);

// //     /* packaging */
// //     if (packaging !== undefined)
// //       product.packaging = parsePackaging(packaging);

// //     /* Pricing */
// //     if (basePrice !== undefined) product.basePrice = Number(basePrice);
// //     if (profit    !== undefined && profit !== "") product.profit = Number(profit);

// //     /* HSN → resolve GST & CESS */
// //     const resolvedHsn = hsnCode !== undefined ? hsnCode : product.hsnCode;
// //     product.hsnCode   = resolvedHsn || "";

// //     const hsnEntry = resolvedHsn
// //       ? await HsnCode.findOne({ code: resolvedHsn.trim(), active: true }).lean()
// //       : null;

// //     const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? Number(product.gstPercent  || 0));
// //     const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? Number(product.cessPercent || 0));

// //     product.gstPercent  = gst;
// //     product.cessPercent = cess;
// //     product.taxType     = taxType || product.taxType || "cgst_sgst";

// //     /* Always recalculate — no manual override */
// //     const breakdown = calcGstBreakdown(
// //       Number(product.basePrice),
// //       Number(product.profit || 0),
// //       gst, cess,
// //       product.taxType
// //     );

// //     product.salePrice         = breakdown.salePrice;
// //     product.discount          = product.basePrice > breakdown.salePrice ? product.basePrice - breakdown.salePrice : 0;
// //     product.priceExcludingGst = breakdown.priceExcludingGst;
// //     product.gstAmount         = breakdown.gstAmount;
// //     product.cgstPercent       = breakdown.cgstPercent;
// //     product.sgstPercent       = breakdown.sgstPercent;
// //     product.igstPercent       = breakdown.igstPercent;
// //     product.cgstAmount        = breakdown.cgstAmount;
// //     product.sgstAmount        = breakdown.sgstAmount;
// //     product.igstAmount        = breakdown.igstAmount;
// //     product.cessAmount        = breakdown.cessAmount;
// //     product.totalTaxAmount    = breakdown.totalTaxAmount;

// //     await product.save();
// //     const hsnMap = await getHsnMap();
// //     res.json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
// //   } catch (err) {
// //     console.error("updateProduct error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    UPDATE STATUS
// // ══════════════════════════════════════════════════════════════ */
// // exports.updateStatus = async (req, res) => {
// //   try {
// //     const updated = await VendorProduct.findOneAndUpdate(
// //       { _id: req.params.id, vendor: req.vendor.id },
// //       { status: req.body.status },
// //       { new: true }
// //     ).lean();
// //     if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
// //     const hsnMap = await getHsnMap();
// //     res.json({ success: true, data: buildProduct(updated, hsnMap) });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    COPY PRODUCT
// // ══════════════════════════════════════════════════════════════ */
// // exports.copyProduct = async (req, res) => {
// //   try {
// //     const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id }).lean();
// //     if (!item) return res.status(404).json({ success: false, message: "Product not found" });

// //     const breakdown = calcGstBreakdown(
// //       Number(item.basePrice),
// //       Number(item.profit      || 0),
// //       Number(item.gstPercent  || 0),
// //       Number(item.cessPercent || 0),
// //       item.taxType || "cgst_sgst"
// //     );

// //     const newItem = await VendorProduct.create({
// //       vendor:          req.vendor.id,
// //       name:            item.name + " (Copy)",
// //       brand:           item.brand,
// //       category:        item.category,
// //       subcategory:     item.subcategory,
// //       subSubCategory:  item.subSubCategory,
// //       weight:          item.weight || null,
// //       unitConversions: item.unitConversions ? [...item.unitConversions] : [],
// //       packaging:       item.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
// //       description:     item.description || "",
// //       image:           item.image        || "",
// //       galleryImages:   item.galleryImages ? [...item.galleryImages] : [],

// //       basePrice:   item.basePrice,
// //       profit:      item.profit     || 0,
// //       salePrice:   breakdown.salePrice,
// //       discount:    item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0,

// //       gstPercent:  item.gstPercent  || 0,
// //       cessPercent: item.cessPercent || 0,
// //       hsnCode:     item.hsnCode     || "",
// //       taxType:     item.taxType     || "cgst_sgst",

// //       priceExcludingGst: breakdown.priceExcludingGst,
// //       gstAmount:         breakdown.gstAmount,
// //       cgstPercent:       breakdown.cgstPercent,
// //       sgstPercent:       breakdown.sgstPercent,
// //       igstPercent:       breakdown.igstPercent,
// //       cgstAmount:        breakdown.cgstAmount,
// //       sgstAmount:        breakdown.sgstAmount,
// //       igstAmount:        breakdown.igstAmount,
// //       cessAmount:        breakdown.cessAmount,
// //       totalTaxAmount:    breakdown.totalTaxAmount,

// //       validTill: item.validTill,
// //       status:    "inactive",
// //     });

// //     const hsnMap = await getHsnMap();
// //     res.json({ success: true, data: buildProduct(newItem.toObject(), hsnMap) });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    DELETE PRODUCT
// // ══════════════════════════════════════════════════════════════ */
// // exports.deleteProduct = async (req, res) => {
// //   try {
// //     const deleted = await VendorProduct.deleteOne({ _id: req.params.id, vendor: req.vendor.id });
// //     if (!deleted.deletedCount) return res.status(404).json({ success: false, message: "Product not found" });
// //     res.json({ success: true, message: "Product deleted" });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    DELETE SELECTED
// // ══════════════════════════════════════════════════════════════ */
// // exports.deleteSelected = async (req, res) => {
// //   try {
// //     await VendorProduct.deleteMany({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id });
// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    BULK UPDATE
// //    salePrice always recalculated from GST breakdown
// // ══════════════════════════════════════════════════════════════ */
// // exports.bulkUpdateProducts = async (req, res) => {
// //   try {
// //     const hsnMap = await getHsnMap();
// //     const updated = [];

// //     for (const p of req.body.products) {
// //       const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
// //       if (!item) continue;

// //       if (p.basePrice   !== undefined) item.basePrice   = Number(p.basePrice);
// //       if (p.profit      !== undefined) item.profit      = Number(p.profit);
// //       if (p.gstPercent  !== undefined) item.gstPercent  = Number(p.gstPercent);
// //       if (p.cessPercent !== undefined) item.cessPercent = Number(p.cessPercent);
// //       if (p.hsnCode     !== undefined) item.hsnCode     = p.hsnCode;
// //       if (p.taxType     !== undefined) item.taxType     = p.taxType;
// //       if (p.brand       !== undefined) item.brand       = p.brand;
// //       if (p.status      !== undefined) item.status      = p.status;

// //       const breakdown = calcGstBreakdown(
// //         Number(item.basePrice),
// //         Number(item.profit      || 0),
// //         Number(item.gstPercent  || 0),
// //         Number(item.cessPercent || 0),
// //         item.taxType || "cgst_sgst"
// //       );

// //       item.salePrice         = breakdown.salePrice;
// //       item.discount          = item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0;
// //       item.priceExcludingGst = breakdown.priceExcludingGst;
// //       item.gstAmount         = breakdown.gstAmount;
// //       item.cgstPercent       = breakdown.cgstPercent;
// //       item.sgstPercent       = breakdown.sgstPercent;
// //       item.igstPercent       = breakdown.igstPercent;
// //       item.cgstAmount        = breakdown.cgstAmount;
// //       item.sgstAmount        = breakdown.sgstAmount;
// //       item.igstAmount        = breakdown.igstAmount;
// //       item.cessAmount        = breakdown.cessAmount;
// //       item.totalTaxAmount    = breakdown.totalTaxAmount;

// //       await item.save();
// //       updated.push(buildProduct(item.toObject(), hsnMap));
// //     }

// //     res.json({ success: true, updated });
// //   } catch (err) {
// //     console.error("bulkUpdateProducts error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    EXPORT ALL
// // ══════════════════════════════════════════════════════════════ */
// // exports.exportProducts = async (req, res) => {
// //   try {
// //     const data   = await VendorProduct.find({ vendor: req.vendor.id }).populate("category", "name").lean();
// //     const hsnMap = await getHsnMap();

// //     res.setHeader("Content-Disposition", "attachment; filename=vendor_products.csv");
// //     res.setHeader("Content-Type", "text/csv");

// //     const stream = csv.format({ headers: true });
// //     stream.pipe(res);

// //     for (const p of data) {
// //       const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
// //       stream.write({
// //         id:                p._id,
// //         name:              p.name,
// //         brand:             p.brand             || "",
// //         category:          p.category?.name    || "",
// //         subcategory:       p.subcategory?.name || "",
// //         subSubCategory:    p.subSubCategory?.name || "",
// //         image:             p.image             || "",
// //         galleryImages:     (p.galleryImages || []).join("|"),
// //         weight:            p.weight ? JSON.stringify(p.weight) : "",
// //         unitConversions:   JSON.stringify(p.unitConversions || []),
// //         packaging:         JSON.stringify(p.packaging || {}),
// //         description:       p.description       || "",
// //         basePrice:         p.basePrice,
// //         profit:            p.profit            || 0,
// //         salePrice:         p.salePrice,
// //         discount:          p.discount          || 0,
// //         gstPercent:        p.gstPercent        || 0,
// //         cessPercent:       p.cessPercent       || 0,
// //         hsnCode:           p.hsnCode           || "",
// //         hsnDescription:    h?.description      || "",
// //         taxType:           p.taxType           || "cgst_sgst",
// //         priceExcludingGst: p.priceExcludingGst || 0,
// //         gstAmount:         p.gstAmount         || 0,
// //         cgstPercent:       p.cgstPercent       || 0,
// //         sgstPercent:       p.sgstPercent       || 0,
// //         igstPercent:       p.igstPercent       || 0,
// //         cgstAmount:        p.cgstAmount        || 0,
// //         sgstAmount:        p.sgstAmount        || 0,
// //         igstAmount:        p.igstAmount        || 0,
// //         cessAmount:        p.cessAmount        || 0,
// //         totalTaxAmount:    p.totalTaxAmount    || 0,
// //         status:            p.status,
// //       });
// //     }
// //     stream.end();
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    EXPORT SELECTED
// // ══════════════════════════════════════════════════════════════ */
// // exports.exportSelected = async (req, res) => {
// //   try {
// //     const data   = await VendorProduct.find({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id }).populate("category", "name").lean();
// //     const hsnMap = await getHsnMap();

// //     res.setHeader("Content-Disposition", "attachment; filename=selected_vendor_products.csv");
// //     res.setHeader("Content-Type", "text/csv");

// //     const stream = csv.format({ headers: true });
// //     stream.pipe(res);

// //     for (const p of data) {
// //       const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
// //       stream.write({
// //         id:                p._id,
// //         name:              p.name,
// //         brand:             p.brand             || "",
// //         category:          p.category?.name    || "",
// //         subcategory:       p.subcategory?.name || "",
// //         subSubCategory:    p.subSubCategory?.name || "",
// //         image:             p.image             || "",
// //         galleryImages:     (p.galleryImages || []).join("|"),
// //         weight:            p.weight ? JSON.stringify(p.weight) : "",
// //         unitConversions:   JSON.stringify(p.unitConversions || []),
// //         packaging:         JSON.stringify(p.packaging || {}),
// //         description:       p.description       || "",
// //         basePrice:         p.basePrice,
// //         profit:            p.profit            || 0,
// //         salePrice:         p.salePrice,
// //         discount:          p.discount          || 0,
// //         gstPercent:        p.gstPercent        || 0,
// //         cessPercent:       p.cessPercent       || 0,
// //         hsnCode:           p.hsnCode           || "",
// //         hsnDescription:    h?.description      || "",
// //         taxType:           p.taxType           || "cgst_sgst",
// //         priceExcludingGst: p.priceExcludingGst || 0,
// //         gstAmount:         p.gstAmount         || 0,
// //         cgstPercent:       p.cgstPercent       || 0,
// //         sgstPercent:       p.sgstPercent       || 0,
// //         igstPercent:       p.igstPercent       || 0,
// //         cgstAmount:        p.cgstAmount        || 0,
// //         sgstAmount:        p.sgstAmount        || 0,
// //         igstAmount:        p.igstAmount        || 0,
// //         cessAmount:        p.cessAmount        || 0,
// //         totalTaxAmount:    p.totalTaxAmount    || 0,
// //         status:            p.status,
// //       });
// //     }
// //     stream.end();
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    IMPORT CSV
// //    salePrice always from breakdown — never from CSV column
// // ══════════════════════════════════════════════════════════════ */
// // exports.importProducts = async (req, res) => {
// //   try {
// //     if (!req.file) return res.status(400).json({ success: false, message: "CSV file required" });

// //     const rows = [];
// //     await new Promise((resolve, reject) => {
// //       csv.parseString(req.file.buffer.toString("utf-8"), { headers: true })
// //         .on("data", (row) => rows.push(row))
// //         .on("end",   resolve)
// //         .on("error", reject);
// //     });

// //     const hsnMap = await getHsnMap();
// //     let imported = 0;

// //     for (const r of rows) {
// //       try {
// //         const base      = Number(r.basePrice || 0);
// //         const hsnCode   = r.hsnCode || "";
// //         const hsnEntry  = hsnCode ? hsnMap[hsnCode.trim()] || null : null;
// //         const gst       = r.gstPercent  ? Number(r.gstPercent)  : (hsnEntry?.gst  ?? 0);
// //         const cess      = r.cessPercent ? Number(r.cessPercent) : (hsnEntry?.cess ?? 0);
// //         const profitAmt = r.profit ? Number(r.profit) : 0;
// //         const tax       = r.taxType || "cgst_sgst";

// //         const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

// //         let weight = null;
// //         try {
// //           const w = JSON.parse(r.weight);
// //           if (w && w.value && Number(w.value) > 0) {
// //             if (w.unit === "g") w.unit = "gm";
// //             weight = w;
// //           }
// //         } catch {}

// //         const unitConversionsParsed = parseUnitConversions(r.unitConversions);
// //         const packagingParsed       = parsePackaging(r.packaging);

// //         const cat = await VendorCategory.findOne({ name: r.category?.trim() });
// //         if (!cat) { console.log("Category not found:", r.category); continue; }

// //         let subCat    = { id: null, name: null, image: null };
// //         let subSubCat = { id: null, name: null, image: null };
// //         if (r.subcategory) {
// //           const sub = cat.subcategories?.find((s) => s.name.toLowerCase() === r.subcategory.trim().toLowerCase());
// //           if (sub) {
// //             subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
// //             if (r.subSubCategory) {
// //               const ss = sub.subSubCategories?.find((x) => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase());
// //               if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
// //             }
// //           }
// //         }

// //         const mainUrl     = r.image?.startsWith("http") ? r.image.trim() : "";
// //         const galleryUrls = r.galleryImages
// //           ? r.galleryImages.split("|").map((u) => u.trim()).filter((u) => u.startsWith("http")).slice(0, 4)
// //           : [];

// //         await VendorProduct.create({
// //           vendor:          req.vendor.id,
// //           name:            r.name,
// //           brand:           r.brand,
// //           category:        cat._id,
// //           subcategory:     subCat,
// //           subSubCategory:  subSubCat,
// //           weight,
// //           unitConversions: unitConversionsParsed,
// //           packaging:       packagingParsed,
// //           description:     r.description || "",
// //           image:           mainUrl,
// //           galleryImages:   galleryUrls,
// //           basePrice:       base,
// //           profit:          profitAmt,
// //           salePrice:       breakdown.salePrice,
// //           discount:        base > breakdown.salePrice ? base - breakdown.salePrice : 0,
// //           gstPercent:      gst,
// //           cessPercent:     cess,
// //           hsnCode,
// //           taxType:         tax,
// //           priceExcludingGst: breakdown.priceExcludingGst,
// //           gstAmount:         breakdown.gstAmount,
// //           cgstPercent:       breakdown.cgstPercent,
// //           sgstPercent:       breakdown.sgstPercent,
// //           igstPercent:       breakdown.igstPercent,
// //           cgstAmount:        breakdown.cgstAmount,
// //           sgstAmount:        breakdown.sgstAmount,
// //           igstAmount:        breakdown.igstAmount,
// //           cessAmount:        breakdown.cessAmount,
// //           totalTaxAmount:    breakdown.totalTaxAmount,
// //           status:            r.status || "inactive",
// //         });
// //         imported++;
// //       } catch (e) {
// //         console.log("Row skipped:", r.name, e.message);
// //       }
// //     }

// //     res.json({ success: true, imported });
// //   } catch (err) {
// //     console.error("importProducts error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /* ══════════════════════════════════════════════════════════════
// //    FIX ALL PRODUCT PRICES  (one-time migration utility)
// //    POST /api/vendor/products/fix-prices
// // ══════════════════════════════════════════════════════════════ */
// // exports.fixAllProductPrices = async (req, res) => {
// //   try {
// //     const products = await VendorProduct.find({ vendor: req.vendor.id });
// //     let fixed = 0;

// //     for (const p of products) {
// //       const breakdown = calcGstBreakdown(
// //         Number(p.basePrice),
// //         Number(p.profit      || 0),
// //         Number(p.gstPercent  || 0),
// //         Number(p.cessPercent || 0),
// //         p.taxType || "cgst_sgst"
// //       );

// //       p.salePrice         = breakdown.salePrice;
// //       p.discount          = p.basePrice > breakdown.salePrice ? p.basePrice - breakdown.salePrice : 0;
// //       p.priceExcludingGst = breakdown.priceExcludingGst;
// //       p.gstAmount         = breakdown.gstAmount;
// //       p.cgstPercent       = breakdown.cgstPercent;
// //       p.sgstPercent       = breakdown.sgstPercent;
// //       p.igstPercent       = breakdown.igstPercent;
// //       p.cgstAmount        = breakdown.cgstAmount;
// //       p.sgstAmount        = breakdown.sgstAmount;
// //       p.igstAmount        = breakdown.igstAmount;
// //       p.cessAmount        = breakdown.cessAmount;
// //       p.totalTaxAmount    = breakdown.totalTaxAmount;

// //       await p.save();
// //       fixed++;
// //     }

// //     res.json({ success: true, message: `${fixed} products recalculated.` });
// //   } catch (err) {
// //     console.error("fixAllProductPrices error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };



// const mongoose = require("mongoose");
// const VendorProduct  = require("../models/vendorProduct");
// // const VendorCategory = require("../models/VendorCategory");
// const Category = require("../models/categoryModel");
// const Brand          = require("../models/brandModel");
// const cloudinary     = require("../utils/cloudinary");
// const csv            = require("fast-csv");

// const HsnCode =
//   mongoose.models.HsnCode || require("../models/Hsncode");


// const uploadToFolder = (buffer, folder) =>
//   new Promise((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream({ folder }, (err, result) => {
//         if (err) reject(err);
//         else resolve(result.secure_url);
//       })
//       .end(buffer);
//   });

// const uploadMain    = (buf) => uploadToFolder(buf, "price_images/main");
// const uploadGallery = (buf) => uploadToFolder(buf, "price_images/gallery");

// async function uploadManyGallery(files = [], limit = 4) {
//   if (!files || !files.length) return [];
//   return Promise.all(
//     files.slice(0, limit).map((f) => uploadGallery(f.buffer))
//   );
// }

// function calcGstBreakdown(base, profit, gstPercent, cessPercent, taxType) {
//   const basePrice   = Number(base)   || 0;
//   const profitPrice = Number(profit) || 0;

//   const salePrice = basePrice + profitPrice;

//   const gst  = Number(gstPercent)  || 0;
//   const cess = Number(cessPercent) || 0;

//   const gstAmount      = (salePrice * gst)  / (100 + gst);
//   const cessAmount     = (salePrice * cess) / (100 + cess);
//   const totalTaxAmount = gstAmount + cessAmount;
//   const priceExcludingGst = salePrice - totalTaxAmount;

//   const isIgst = taxType === "igst";

//   const cgstPercent = isIgst ? 0 : gst / 2;
//   const sgstPercent = isIgst ? 0 : gst / 2;
//   const igstPercent = isIgst ? gst : 0;

//   const cgstAmount = isIgst ? 0 : gstAmount / 2;
//   const sgstAmount = isIgst ? 0 : gstAmount / 2;
//   const igstAmount = isIgst ? gstAmount : 0;

//   const r2 = (n) => Math.round(n * 100) / 100;

//   return {
//     salePrice:          r2(salePrice),
//     priceExcludingGst:  r2(priceExcludingGst),
//     gstAmount:          r2(gstAmount),
//     cessAmount:         r2(cessAmount),
//     totalTaxAmount:     r2(totalTaxAmount),
//     cgstPercent:        r2(cgstPercent),
//     sgstPercent:        r2(sgstPercent),
//     igstPercent:        r2(igstPercent),
//     cgstAmount:         r2(cgstAmount),
//     sgstAmount:         r2(sgstAmount),
//     igstAmount:         r2(igstAmount),
//   };
// }

// /* ══════════════════════════════════════════════════════════════
//    PARSE HELPERS
// ══════════════════════════════════════════════════════════════ */
// const parseJSON = (str, fallback = null) => {
//   try { return JSON.parse(str); } catch { return fallback; }
// };

// function parseSub(raw) {
//   if (!raw || raw === "null" || raw === "") return null;
//   try {
//     const s = JSON.parse(raw);
//     if (!s || !s.id) return null;
//     return { id: s.id, name: s.name || "", image: s.image || "" };
//   } catch { return null; }
// }

// function parseSubSub(raw) {
//   if (!raw || raw === "null" || raw === "") return null;
//   try {
//     const s = JSON.parse(raw);
//     if (!s || !s.id) return null;
//     return { id: s.id, name: s.name || "", image: s.image || "" };
//   } catch { return null; }
// }

// /* ══════════════════════════════════════════════════════════════
//    PARSE unitConversions from request body
//    Accepts string (JSON) or array
//    Each entry: { unit: "Dozen", nPcs: 12 }
// ══════════════════════════════════════════════════════════════ */
// function parseUnitConversions(raw) {
//   if (!raw) return [];
//   let arr = raw;
//   if (typeof raw === "string") {
//     try { arr = JSON.parse(raw); } catch { return []; }
//   }
//   if (!Array.isArray(arr)) return [];
//   return arr
//     .filter((u) => u && u.unit && Number(u.nPcs) > 0)
//     .map((u) => ({ unit: String(u.unit).trim(), nPcs: Number(u.nPcs) }));
// }

// /* ══════════════════════════════════════════════════════════════
//    PARSE packaging from request body
// ══════════════════════════════════════════════════════════════ */
// function parsePackaging(raw) {
//   const def = { box: 0, packetPerBox: 0, piecePerPacket: 0 };
//   if (!raw) return def;
//   let obj = raw;
//   if (typeof raw === "string") {
//     try { obj = JSON.parse(raw); } catch { return def; }
//   }
//   return {
//     box:            Number(obj.box)            || 0,
//     packetPerBox:   Number(obj.packetPerBox)   || 0,
//     piecePerPacket: Number(obj.piecePerPacket) || 0,
//   };
// }


// async function getHsnMap() {
//   const all = await HsnCode.find({ active: true }).lean();
//   return all.reduce((acc, h) => { acc[h.code.trim()] = h; return acc; }, {});
// }


// function buildProduct(p, hsnMap = {}) {
//   const hsnInfo = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
//   return {
//     _id:               p._id,
//     vendor:            p.vendor,
//     name:              p.name,
//     brand:             p.brand || null,
//     category:          p.category,
//     subcategory:       p.subcategory,
//     subSubCategory:    p.subSubCategory,
//     weight:            p.weight || null,
//     unitConversions:   p.unitConversions  || [],
//     unitDefs: (p.unitConversions || []).map((u) => ({ label: u.unit, multiplier: u.nPcs, })),
//     packaging:         p.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
//     description:       p.description     || "",
//     image:             p.image           || "",
//     galleryImages:     p.galleryImages   || [],
//     basePrice:         p.basePrice,
//     salePrice:         p.salePrice,
//     profit:            p.profit          || 0,
//     discount:          p.discount        || 0,
//     gstPercent:        p.gstPercent      ?? 0,
//     cessPercent:       p.cessPercent     ?? 0,
//     hsnCode:           p.hsnCode         || "",
//     taxType:           p.taxType         || "cgst_sgst",
//     priceExcludingGst: p.priceExcludingGst ?? 0,
//     gstAmount:         p.gstAmount         ?? 0,
//     cgstPercent:       p.cgstPercent       ?? 0,
//     sgstPercent:       p.sgstPercent       ?? 0,
//     igstPercent:       p.igstPercent       ?? 0,
//     cgstAmount:        p.cgstAmount        ?? 0,
//     sgstAmount:        p.sgstAmount        ?? 0,
//     igstAmount:        p.igstAmount        ?? 0,
//     cessAmount:        p.cessAmount        ?? 0,
//     totalTaxAmount:    p.totalTaxAmount    ?? 0,
//     hsnDescription:    hsnInfo?.description || "",
//     hsnCategory:       hsnInfo?.category    || "",
//     validTill:         p.validTill,
//     status:            p.status,
//     createdAt:         p.createdAt,
//     updatedAt:         p.updatedAt,
//   };
// }

// /* ══════════════════════════════════════════════════════════════
//    HSN — GET ALL
// ══════════════════════════════════════════════════════════════ */
// exports.getHsnCodes = async (req, res) => {
//   try {
//     const { search, category } = req.query;
//     const query = { active: true };
//     if (category) query.category = new RegExp("^" + category + "$", "i");
//     if (search) {
//       const q = new RegExp(search, "i");
//       query.$or = [{ code: q }, { description: q }, { category: q }];
//     }
//     const results    = await HsnCode.find(query).sort({ category: 1, code: 1 }).lean();
//     const categories = await HsnCode.distinct("category", { active: true });
//     const grouped    = results.reduce((acc, h) => {
//       if (!acc[h.category]) acc[h.category] = [];
//       acc[h.category].push(h);
//       return acc;
//     }, {});
//     res.json({ success: true, total: results.length, data: results, grouped, categories });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    HSN — SINGLE
// ══════════════════════════════════════════════════════════════ */
// exports.getHsnByCode = async (req, res) => {
//   try {
//     const hsn = await HsnCode.findOne({ code: req.params.code.trim(), active: true }).lean();
//     if (!hsn) return res.status(404).json({ success: false, message: "HSN not found" });
//     res.json({ success: true, data: hsn });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    HSN — CREATE
// ══════════════════════════════════════════════════════════════ */
// exports.createHsnCode = async (req, res) => {
//   try {
//     const { code, description, category, gst, cess } = req.body;
//     if (!code || !description || !category || gst === undefined)
//       return res.status(400).json({ success: false, message: "code, description, category & gst required" });
//     const existing = await HsnCode.findOne({ code: code.trim() });
//     if (existing) return res.status(409).json({ success: false, message: "HSN already exists" });
//     const hsn = await HsnCode.create({
//       code:        code.trim(),
//       description: description.trim(),
//       category:    category.trim(),
//       gst:         Number(gst),
//       cess:        Number(cess) || 0,
//     });
//     res.status(201).json({ success: true, data: hsn });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    CREATE PRODUCT
//    salePrice is ALWAYS calculated from GST breakdown — never manual
// ══════════════════════════════════════════════════════════════ */
// exports.createProduct = async (req, res) => {
//   try {
//     const {
//       name, brand, category, description, status,
//       basePrice, profit,
//       weight, unitConversions, packaging,
//       subcategory, subSubCategory,
//       gstPercent, cessPercent, hsnCode, taxType, validTill,
//     } = req.body;

//     // const categoryDoc = await VendorCategory.findById(category);
//     const categoryDoc = await Category.findById(category);
//     if (!categoryDoc)
//       return res.status(400).json({ success: false, message: "Invalid category" });

//     const brandDoc = await Brand.findById(brand);
//     if (!brandDoc)
//       return res.status(400).json({ success: false, message: "Invalid brand" });

//     /* Images */
//     const mainFile    = req.files?.mainImage?.[0];
//     const mainUrl     = mainFile ? await uploadMain(mainFile.buffer) : "";
//     const galleryUrls = await uploadManyGallery(req.files?.galleryImages || [], 4);

//     /* Weight — optional, null if not provided */
//     let parsedWeight = null;
//     if (weight) {
//       parsedWeight = parseJSON(weight, null);
//       if (parsedWeight) {
//         if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
//         if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit))
//           parsedWeight.unit = "kg";
//         if (!parsedWeight.value || parsedWeight.value <= 0) parsedWeight = null;
//       }
//     }

//     const base      = Number(basePrice) || 0;
//     const profitAmt = Number(profit)    || 0;

//     /* HSN → resolve GST & CESS */
//     const hsnEntry = hsnCode
//       ? await HsnCode.findOne({ code: hsnCode.trim(), active: true }).lean()
//       : null;

//     const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? 0);
//     const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? 0);
//     const tax  = taxType || "cgst_sgst";

//     const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

//     const product = await VendorProduct.create({
//       vendor:         req.vendor.id,
//       name,
//       brand:          brandDoc._id,
//       category:       categoryDoc._id,
//       subcategory:    parseSub(subcategory)       || { id: null, name: null, image: null },
//       subSubCategory: parseSubSub(subSubCategory) || { id: null, name: null, image: null },
//       weight:         parsedWeight,
//       unitConversions: parseUnitConversions(unitConversions),
//       packaging:      parsePackaging(packaging),
//       description:    description || "",
//       image:          mainUrl,
//       galleryImages:  galleryUrls,

//       basePrice:  base,
//       profit:     profitAmt,
//       salePrice:  breakdown.salePrice,
//       discount:   base > breakdown.salePrice ? base - breakdown.salePrice : 0,

//       gstPercent:  gst,
//       cessPercent: cess,
//       hsnCode:     hsnCode || "",
//       taxType:     tax,

//       priceExcludingGst: breakdown.priceExcludingGst,
//       gstAmount:         breakdown.gstAmount,
//       cgstPercent:       breakdown.cgstPercent,
//       sgstPercent:       breakdown.sgstPercent,
//       igstPercent:       breakdown.igstPercent,
//       cgstAmount:        breakdown.cgstAmount,
//       sgstAmount:        breakdown.sgstAmount,
//       igstAmount:        breakdown.igstAmount,
//       cessAmount:        breakdown.cessAmount,
//       totalTaxAmount:    breakdown.totalTaxAmount,

//       validTill: validTill || undefined,
//       status:    status    || "inactive",
//     });

//     const hsnMap = await getHsnMap();
//     res.status(201).json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
//   } catch (err) {
//     console.error("createProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    GET MY PRODUCTS
// ══════════════════════════════════════════════════════════════ */
// exports.getMyProducts = async (req, res) => {
//   try {
//     const products = await VendorProduct.find({ vendor: req.vendor.id })
//       .populate("category", "name image subcategories")
//       .sort({ createdAt: -1 })
//       .lean();

//     /* populate only valid brand ObjectIds */
//     const validProducts = products.filter(
//       (p) => p.brand && mongoose.Types.ObjectId.isValid(p.brand)
//     );

//     const populatedProducts = await Brand.populate(validProducts, {
//       path:   "brand",
//       select: "name image",
//     });

//     const hsnMap = await getHsnMap();

//     res.json({
//       success: true,
//       data: populatedProducts.map((p) => buildProduct(p, hsnMap)),
//     });
//   } catch (err) {
//     console.error("getMyProducts error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    GET PRODUCTS TREE
// ══════════════════════════════════════════════════════════════ */
// exports.getVendorProductsTree = async (req, res) => {
//   try {
//     const vendorId   = req.vendor.id;
//     // const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
//     const categories = await Category.find().lean();
//     const products   = await VendorProduct.find({ vendor: vendorId }).lean();

//     const data = categories.map((cat) => ({
//       _id:  cat._id,
//       name: cat.name,
//       image: cat.image,
//       subcategories: (cat.subcategories || []).filter((s) => s.active).map((sub) => ({
//         _id:  sub._id,
//         name: sub.name,
//         image: sub.image,
//         subSubcategories: (sub.subSubcategories || []).filter((ss) => ss.active).map((ss) => ({
//           _id:      ss._id,
//           name:     ss.name,
//           image:    ss.image,
//           products: products.filter((p) =>
//             String(p.category) === String(cat._id) &&
//             p.subcategory?.id  === String(sub._id) &&
//             p.subSubCategory?.id === String(ss._id)
//           ),
//         })),
//         products: products.filter((p) =>
//           String(p.category) === String(cat._id) &&
//           p.subcategory?.id  === String(sub._id) &&
//           !p.subSubCategory?.id
//         ),
//       })),
//     }));

//     res.json({ success: true, data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    UPDATE PRODUCT
//    salePrice is ALWAYS recalculated — never manual override
// ══════════════════════════════════════════════════════════════ */
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
//     if (!product) return res.status(404).json({ success: false, message: "Product not found" });

//     const {
//       name, brand, description, status, category,
//       weight, unitConversions, packaging,
//       subcategory, subSubCategory,
//       basePrice, profit,
//       gstPercent, cessPercent, hsnCode, taxType, validTill,
//     } = req.body;

//     /* Images */
//     const mainFile = req.files?.mainImage?.[0];
//     if (mainFile) {
//       product.image = await uploadMain(mainFile.buffer);
//     } else if (req.body.existingMainImage !== undefined) {
//       product.image = req.body.existingMainImage;
//     }

//     let existingGallery = [];
//     try { existingGallery = JSON.parse(req.body.existingGalleryImages || "[]"); } catch {}
//     const slotsLeft  = Math.max(0, 4 - existingGallery.length);
//     const newGallery = await uploadManyGallery(req.files?.galleryImages || [], slotsLeft);
//     product.galleryImages = [...existingGallery, ...newGallery].slice(0, 4);

//     /* Basic fields */
//     // if (name        !== undefined) product.name        = name;
//     // if (brand       !== undefined) product.brand       = brand;
//     // if (description !== undefined) product.description = description;
//     // if (status      !== undefined) product.status      = status;
//     // if (category    !== undefined) product.category    = category;
//     // if (validTill   !== undefined) product.validTill   = validTill || undefined;

//     if (name !== undefined) {
//   product.name = name;
// }

// if (brand !== undefined) {
//   product.brand = brand;
// }

// if (description !== undefined) {
//   product.description = description;
// }

// if (status !== undefined) {
//   product.status = status;
// }

// if (category !== undefined) {
//   const categoryDoc = await Category.findById(category);

//   if (!categoryDoc) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid category",
//     });
//   }

//   product.category = categoryDoc._id;
// }

// if (validTill !== undefined) {
//   product.validTill = validTill || undefined;
// }

//     if (subcategory    !== undefined)
//       product.subcategory    = parseSub(subcategory)       || { id: null, name: null, image: null };
//     if (subSubCategory !== undefined)
//       product.subSubCategory = parseSubSub(subSubCategory) || { id: null, name: null, image: null };

//     /* Weight — optional, only set if value provided and valid */
//     if (weight !== undefined) {
//       const w = parseJSON(weight, null);
//       if (w && w.value && Number(w.value) > 0) {
//         if (w.unit === "g") w.unit = "gm";
//         if (!["kg", "gm", "ltr", "ml", "pcs"].includes(w.unit)) w.unit = "kg";
//         product.weight = w;
//       } else {
//         /* empty string or zero value means "clear weight" */
//         product.weight = null;
//       }
//     }

//     /* unitConversions */
//     if (unitConversions !== undefined)
//       product.unitConversions = parseUnitConversions(unitConversions);

//     /* packaging */
//     if (packaging !== undefined)
//       product.packaging = parsePackaging(packaging);

//     /* Pricing */
//     if (basePrice !== undefined) product.basePrice = Number(basePrice);
//     if (profit    !== undefined && profit !== "") product.profit = Number(profit);

//     /* HSN → resolve GST & CESS */
//     const resolvedHsn = hsnCode !== undefined ? hsnCode : product.hsnCode;
//     product.hsnCode   = resolvedHsn || "";

//     const hsnEntry = resolvedHsn
//       ? await HsnCode.findOne({ code: resolvedHsn.trim(), active: true }).lean()
//       : null;

//     const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? Number(product.gstPercent  || 0));
//     const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? Number(product.cessPercent || 0));

//     product.gstPercent  = gst;
//     product.cessPercent = cess;
//     product.taxType     = taxType || product.taxType || "cgst_sgst";

//     /* Always recalculate — no manual override */
//     const breakdown = calcGstBreakdown(
//       Number(product.basePrice),
//       Number(product.profit || 0),
//       gst, cess,
//       product.taxType
//     );

//     product.salePrice         = breakdown.salePrice;
//     product.discount          = product.basePrice > breakdown.salePrice ? product.basePrice - breakdown.salePrice : 0;
//     product.priceExcludingGst = breakdown.priceExcludingGst;
//     product.gstAmount         = breakdown.gstAmount;
//     product.cgstPercent       = breakdown.cgstPercent;
//     product.sgstPercent       = breakdown.sgstPercent;
//     product.igstPercent       = breakdown.igstPercent;
//     product.cgstAmount        = breakdown.cgstAmount;
//     product.sgstAmount        = breakdown.sgstAmount;
//     product.igstAmount        = breakdown.igstAmount;
//     product.cessAmount        = breakdown.cessAmount;
//     product.totalTaxAmount    = breakdown.totalTaxAmount;

//     await product.save();
//     const hsnMap = await getHsnMap();
//     res.json({ success: true, data: buildProduct(product.toObject(), hsnMap) });
//   } catch (err) {
//     console.error("updateProduct error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    UPDATE STATUS
// ══════════════════════════════════════════════════════════════ */
// exports.updateStatus = async (req, res) => {
//   try {
//     const updated = await VendorProduct.findOneAndUpdate(
//       { _id: req.params.id, vendor: req.vendor.id },
//       { status: req.body.status },
//       { new: true }
//     ).lean();
//     if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
//     const hsnMap = await getHsnMap();
//     res.json({ success: true, data: buildProduct(updated, hsnMap) });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    COPY PRODUCT
// ══════════════════════════════════════════════════════════════ */
// exports.copyProduct = async (req, res) => {
//   try {
//     const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id }).lean();
//     if (!item) return res.status(404).json({ success: false, message: "Product not found" });

//     const breakdown = calcGstBreakdown(
//       Number(item.basePrice),
//       Number(item.profit      || 0),
//       Number(item.gstPercent  || 0),
//       Number(item.cessPercent || 0),
//       item.taxType || "cgst_sgst"
//     );

//     const newItem = await VendorProduct.create({
//       vendor:          req.vendor.id,
//       name:            item.name + " (Copy)",
//       brand:           item.brand,
//       category:        item.category,
//       subcategory:     item.subcategory,
//       subSubCategory:  item.subSubCategory,
//       weight:          item.weight || null,
//       unitConversions: item.unitConversions ? [...item.unitConversions] : [],
//       packaging:       item.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
//       description:     item.description || "",
//       image:           item.image        || "",
//       galleryImages:   item.galleryImages ? [...item.galleryImages] : [],

//       basePrice:   item.basePrice,
//       profit:      item.profit     || 0,
//       salePrice:   breakdown.salePrice,
//       discount:    item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0,

//       gstPercent:  item.gstPercent  || 0,
//       cessPercent: item.cessPercent || 0,
//       hsnCode:     item.hsnCode     || "",
//       taxType:     item.taxType     || "cgst_sgst",

//       priceExcludingGst: breakdown.priceExcludingGst,
//       gstAmount:         breakdown.gstAmount,
//       cgstPercent:       breakdown.cgstPercent,
//       sgstPercent:       breakdown.sgstPercent,
//       igstPercent:       breakdown.igstPercent,
//       cgstAmount:        breakdown.cgstAmount,
//       sgstAmount:        breakdown.sgstAmount,
//       igstAmount:        breakdown.igstAmount,
//       cessAmount:        breakdown.cessAmount,
//       totalTaxAmount:    breakdown.totalTaxAmount,

//       validTill: item.validTill,
//       status:    "inactive",
//     });

//     const hsnMap = await getHsnMap();
//     res.json({ success: true, data: buildProduct(newItem.toObject(), hsnMap) });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    DELETE PRODUCT
// ══════════════════════════════════════════════════════════════ */
// exports.deleteProduct = async (req, res) => {
//   try {
//     const deleted = await VendorProduct.deleteOne({ _id: req.params.id, vendor: req.vendor.id });
//     if (!deleted.deletedCount) return res.status(404).json({ success: false, message: "Product not found" });
//     res.json({ success: true, message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    DELETE SELECTED
// ══════════════════════════════════════════════════════════════ */
// exports.deleteSelected = async (req, res) => {
//   try {
//     await VendorProduct.deleteMany({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    BULK UPDATE
//    salePrice always recalculated from GST breakdown
// ══════════════════════════════════════════════════════════════ */
// exports.bulkUpdateProducts = async (req, res) => {
//   try {
//     const hsnMap = await getHsnMap();
//     const updated = [];

//     for (const p of req.body.products) {
//       const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
//       if (!item) continue;

//       if (p.basePrice   !== undefined) item.basePrice   = Number(p.basePrice);
//       if (p.profit      !== undefined) item.profit      = Number(p.profit);
//       if (p.gstPercent  !== undefined) item.gstPercent  = Number(p.gstPercent);
//       if (p.cessPercent !== undefined) item.cessPercent = Number(p.cessPercent);
//       if (p.hsnCode     !== undefined) item.hsnCode     = p.hsnCode;
//       if (p.taxType     !== undefined) item.taxType     = p.taxType;
//       if (p.brand       !== undefined) item.brand       = p.brand;
//       if (p.status      !== undefined) item.status      = p.status;

//       const breakdown = calcGstBreakdown(
//         Number(item.basePrice),
//         Number(item.profit      || 0),
//         Number(item.gstPercent  || 0),
//         Number(item.cessPercent || 0),
//         item.taxType || "cgst_sgst"
//       );

//       item.salePrice         = breakdown.salePrice;
//       item.discount          = item.basePrice > breakdown.salePrice ? item.basePrice - breakdown.salePrice : 0;
//       item.priceExcludingGst = breakdown.priceExcludingGst;
//       item.gstAmount         = breakdown.gstAmount;
//       item.cgstPercent       = breakdown.cgstPercent;
//       item.sgstPercent       = breakdown.sgstPercent;
//       item.igstPercent       = breakdown.igstPercent;
//       item.cgstAmount        = breakdown.cgstAmount;
//       item.sgstAmount        = breakdown.sgstAmount;
//       item.igstAmount        = breakdown.igstAmount;
//       item.cessAmount        = breakdown.cessAmount;
//       item.totalTaxAmount    = breakdown.totalTaxAmount;

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
//    EXPORT ALL
// ══════════════════════════════════════════════════════════════ */
// exports.exportProducts = async (req, res) => {
//   try {
//     const data   = await VendorProduct.find({ vendor: req.vendor.id }).populate("category", "name").lean();
//     const hsnMap = await getHsnMap();

//     res.setHeader("Content-Disposition", "attachment; filename=vendor_products.csv");
//     res.setHeader("Content-Type", "text/csv");

//     const stream = csv.format({ headers: true });
//     stream.pipe(res);

//     for (const p of data) {
//       const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
//       stream.write({
//         id:                p._id,
//         name:              p.name,
//         brand:             p.brand             || "",
//         category:          p.category?.name    || "",
//         subcategory:       p.subcategory?.name || "",
//         subSubCategory:    p.subSubCategory?.name || "",
//         image:             p.image             || "",
//         galleryImages:     (p.galleryImages || []).join("|"),
//         weight:            p.weight ? JSON.stringify(p.weight) : "",
//         unitConversions:   JSON.stringify(p.unitConversions || []),
//         packaging:         JSON.stringify(p.packaging || {}),
//         description:       p.description       || "",
//         basePrice:         p.basePrice,
//         profit:            p.profit            || 0,
//         salePrice:         p.salePrice,
//         discount:          p.discount          || 0,
//         gstPercent:        p.gstPercent        || 0,
//         cessPercent:       p.cessPercent       || 0,
//         hsnCode:           p.hsnCode           || "",
//         hsnDescription:    h?.description      || "",
//         taxType:           p.taxType           || "cgst_sgst",
//         priceExcludingGst: p.priceExcludingGst || 0,
//         gstAmount:         p.gstAmount         || 0,
//         cgstPercent:       p.cgstPercent       || 0,
//         sgstPercent:       p.sgstPercent       || 0,
//         igstPercent:       p.igstPercent       || 0,
//         cgstAmount:        p.cgstAmount        || 0,
//         sgstAmount:        p.sgstAmount        || 0,
//         igstAmount:        p.igstAmount        || 0,
//         cessAmount:        p.cessAmount        || 0,
//         totalTaxAmount:    p.totalTaxAmount    || 0,
//         status:            p.status,
//       });
//     }
//     stream.end();
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    EXPORT SELECTED
// ══════════════════════════════════════════════════════════════ */
// exports.exportSelected = async (req, res) => {
//   try {
//     const data   = await VendorProduct.find({ _id: { $in: req.body.ids || [] }, vendor: req.vendor.id }).populate("category", "name").lean();
//     const hsnMap = await getHsnMap();

//     res.setHeader("Content-Disposition", "attachment; filename=selected_vendor_products.csv");
//     res.setHeader("Content-Type", "text/csv");

//     const stream = csv.format({ headers: true });
//     stream.pipe(res);

//     for (const p of data) {
//       const h = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
//       stream.write({
//         id:                p._id,
//         name:              p.name,
//         brand:             p.brand             || "",
//         category:          p.category?.name    || "",
//         subcategory:       p.subcategory?.name || "",
//         subSubCategory:    p.subSubCategory?.name || "",
//         image:             p.image             || "",
//         galleryImages:     (p.galleryImages || []).join("|"),
//         weight:            p.weight ? JSON.stringify(p.weight) : "",
//         unitConversions:   JSON.stringify(p.unitConversions || []),
//         packaging:         JSON.stringify(p.packaging || {}),
//         description:       p.description       || "",
//         basePrice:         p.basePrice,
//         profit:            p.profit            || 0,
//         salePrice:         p.salePrice,
//         discount:          p.discount          || 0,
//         gstPercent:        p.gstPercent        || 0,
//         cessPercent:       p.cessPercent       || 0,
//         hsnCode:           p.hsnCode           || "",
//         hsnDescription:    h?.description      || "",
//         taxType:           p.taxType           || "cgst_sgst",
//         priceExcludingGst: p.priceExcludingGst || 0,
//         gstAmount:         p.gstAmount         || 0,
//         cgstPercent:       p.cgstPercent       || 0,
//         sgstPercent:       p.sgstPercent       || 0,
//         igstPercent:       p.igstPercent       || 0,
//         cgstAmount:        p.cgstAmount        || 0,
//         sgstAmount:        p.sgstAmount        || 0,
//         igstAmount:        p.igstAmount        || 0,
//         cessAmount:        p.cessAmount        || 0,
//         totalTaxAmount:    p.totalTaxAmount    || 0,
//         status:            p.status,
//       });
//     }
//     stream.end();
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /* ══════════════════════════════════════════════════════════════
//    IMPORT CSV
//    salePrice always from breakdown — never from CSV column
// ══════════════════════════════════════════════════════════════ */
// exports.importProducts = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: "CSV file required" });

//     const rows = [];
//     await new Promise((resolve, reject) => {
//       csv.parseString(req.file.buffer.toString("utf-8"), { headers: true })
//         .on("data", (row) => rows.push(row))
//         .on("end",   resolve)
//         .on("error", reject);
//     });

//     const hsnMap = await getHsnMap();
//     let imported = 0;

//     for (const r of rows) {
//       try {
//         const base      = Number(r.basePrice || 0);
//         const hsnCode   = r.hsnCode || "";
//         const hsnEntry  = hsnCode ? hsnMap[hsnCode.trim()] || null : null;
//         const gst       = r.gstPercent  ? Number(r.gstPercent)  : (hsnEntry?.gst  ?? 0);
//         const cess      = r.cessPercent ? Number(r.cessPercent) : (hsnEntry?.cess ?? 0);
//         const profitAmt = r.profit ? Number(r.profit) : 0;
//         const tax       = r.taxType || "cgst_sgst";

//         const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

//         let weight = null;
//         try {
//           const w = JSON.parse(r.weight);
//           if (w && w.value && Number(w.value) > 0) {
//             if (w.unit === "g") w.unit = "gm";
//             weight = w;
//           }
//         } catch {}

//         const unitConversionsParsed = parseUnitConversions(r.unitConversions);
//         const packagingParsed       = parsePackaging(r.packaging);

//         // const cat = await VendorCategory.findOne({ name: r.category?.trim() });

//         const cat = await Category.findOne({
//   name: r.category?.trim(),
// });
//         if (!cat) { console.log("Category not found:", r.category); continue; }

//         let subCat    = { id: null, name: null, image: null };
//         let subSubCat = { id: null, name: null, image: null };
//         if (r.subcategory) {
//           const sub = cat.subcategories?.find((s) => s.name.toLowerCase() === r.subcategory.trim().toLowerCase());
//           if (sub) {
//             subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
//             if (r.subSubCategory) {
//               const ss = sub.subSubcategories?.find((x) => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase());
//               if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
//             }
//           }
//         }

//         const mainUrl     = r.image?.startsWith("http") ? r.image.trim() : "";
//         const galleryUrls = r.galleryImages
//           ? r.galleryImages.split("|").map((u) => u.trim()).filter((u) => u.startsWith("http")).slice(0, 4)
//           : [];

//         await VendorProduct.create({
//           vendor:          req.vendor.id,
//           name:            r.name,
//           brand:           r.brand,
//           category:        cat._id,
//           subcategory:     subCat,
//           subSubCategory:  subSubCat,
//           weight,
//           unitConversions: unitConversionsParsed,
//           packaging:       packagingParsed,
//           description:     r.description || "",
//           image:           mainUrl,
//           galleryImages:   galleryUrls,
//           basePrice:       base,
//           profit:          profitAmt,
//           salePrice:       breakdown.salePrice,
//           discount:        base > breakdown.salePrice ? base - breakdown.salePrice : 0,
//           gstPercent:      gst,
//           cessPercent:     cess,
//           hsnCode,
//           taxType:         tax,
//           priceExcludingGst: breakdown.priceExcludingGst,
//           gstAmount:         breakdown.gstAmount,
//           cgstPercent:       breakdown.cgstPercent,
//           sgstPercent:       breakdown.sgstPercent,
//           igstPercent:       breakdown.igstPercent,
//           cgstAmount:        breakdown.cgstAmount,
//           sgstAmount:        breakdown.sgstAmount,
//           igstAmount:        breakdown.igstAmount,
//           cessAmount:        breakdown.cessAmount,
//           totalTaxAmount:    breakdown.totalTaxAmount,
//           status:            r.status || "inactive",
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


// exports.fixAllProductPrices = async (req, res) => {
//   try {
//     const products = await VendorProduct.find({ vendor: req.vendor.id });
//     let fixed = 0;

//     for (const p of products) {
//       const breakdown = calcGstBreakdown(
//         Number(p.basePrice),
//         Number(p.profit      || 0),
//         Number(p.gstPercent  || 0),
//         Number(p.cessPercent || 0),
//         p.taxType || "cgst_sgst"
//       );

//       p.salePrice         = breakdown.salePrice;
//       p.discount          = p.basePrice > breakdown.salePrice ? p.basePrice - breakdown.salePrice : 0;
//       p.priceExcludingGst = breakdown.priceExcludingGst;
//       p.gstAmount         = breakdown.gstAmount;
//       p.cgstPercent       = breakdown.cgstPercent;
//       p.sgstPercent       = breakdown.sgstPercent;
//       p.igstPercent       = breakdown.igstPercent;
//       p.cgstAmount        = breakdown.cgstAmount;
//       p.sgstAmount        = breakdown.sgstAmount;
//       p.igstAmount        = breakdown.igstAmount;
//       p.cessAmount        = breakdown.cessAmount;
//       p.totalTaxAmount    = breakdown.totalTaxAmount;

//       await p.save();
//       fixed++;
//     }

//     res.json({ success: true, message: `${fixed} products recalculated.` });
//   } catch (err) {
//     console.error("fixAllProductPrices error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


const mongoose = require("mongoose");
const VendorProduct  = require("../models/vendorProduct");
// const VendorCategory = require("../models/VendorCategory");
const Category = require("../models/categoryModel");
const Brand          = require("../models/brandModel");
const cloudinary     = require("../utils/cloudinary");
const csv            = require("fast-csv");

const HsnCode =
  mongoose.models.HsnCode || require("../models/Hsncode");


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

function calcGstBreakdown(base, profit, gstPercent, cessPercent, taxType) {
  const basePrice   = Number(base)   || 0;
  const profitPrice = Number(profit) || 0;

  const salePrice = basePrice + profitPrice;

  const gst  = Number(gstPercent)  || 0;
  const cess = Number(cessPercent) || 0;

  const gstAmount      = (salePrice * gst)  / (100 + gst);
  const cessAmount     = (salePrice * cess) / (100 + cess);
  const totalTaxAmount = gstAmount + cessAmount;
  const priceExcludingGst = salePrice - totalTaxAmount;

  const isIgst = taxType === "igst";

  const cgstPercent = isIgst ? 0 : gst / 2;
  const sgstPercent = isIgst ? 0 : gst / 2;
  const igstPercent = isIgst ? gst : 0;

  const cgstAmount = isIgst ? 0 : gstAmount / 2;
  const sgstAmount = isIgst ? 0 : gstAmount / 2;
  const igstAmount = isIgst ? gstAmount : 0;

  const r2 = (n) => Math.round(n * 100) / 100;

  return {
    salePrice:          r2(salePrice),
    priceExcludingGst:  r2(priceExcludingGst),
    gstAmount:          r2(gstAmount),
    cessAmount:         r2(cessAmount),
    totalTaxAmount:     r2(totalTaxAmount),
    cgstPercent:        r2(cgstPercent),
    sgstPercent:        r2(sgstPercent),
    igstPercent:        r2(igstPercent),
    cgstAmount:         r2(cgstAmount),
    sgstAmount:         r2(sgstAmount),
    igstAmount:         r2(igstAmount),
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
   PARSE unitConversions from request body
   Accepts string (JSON) or array
   Each entry: { unit: "Dozen", nPcs: 12 }
══════════════════════════════════════════════════════════════ */
function parseUnitConversions(raw) {
  if (!raw) return [];
  let arr = raw;
  if (typeof raw === "string") {
    try { arr = JSON.parse(raw); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((u) => u && u.unit && Number(u.nPcs) > 0)
    .map((u) => ({ unit: String(u.unit).trim(), nPcs: Number(u.nPcs) }));
}

/* ══════════════════════════════════════════════════════════════
   PARSE packaging from request body
══════════════════════════════════════════════════════════════ */
function parsePackaging(raw) {
  const def = { box: 0, packetPerBox: 0, piecePerPacket: 0 };
  if (!raw) return def;
  let obj = raw;
  if (typeof raw === "string") {
    try { obj = JSON.parse(raw); } catch { return def; }
  }
  return {
    box:            Number(obj.box)            || 0,
    packetPerBox:   Number(obj.packetPerBox)   || 0,
    piecePerPacket: Number(obj.piecePerPacket) || 0,
  };
}


async function getHsnMap() {
  const all = await HsnCode.find({ active: true }).lean();
  return all.reduce((acc, h) => { acc[h.code.trim()] = h; return acc; }, {});
}


function buildProduct(p, hsnMap = {}) {
  const hsnInfo = p.hsnCode ? hsnMap[p.hsnCode.trim()] || null : null;
  return {
    _id:               p._id,
    vendor:            p.vendor,
    name:              p.name,
    brand:             p.brand || null,
    category:          p.category,
    subcategory:       p.subcategory,
    subSubCategory:    p.subSubCategory,
    weight:            p.weight || null,
    unitConversions:   p.unitConversions  || [],
    unitDefs: (p.unitConversions || []).map((u) => ({ label: u.unit, multiplier: u.nPcs, })),
    packaging:         p.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
    description:       p.description     || "",
    image:             p.image           || "",
    galleryImages:     p.galleryImages   || [],
    basePrice:         p.basePrice,
    salePrice:         p.salePrice,

mrp:               p.mrp || 0,
    profit:            p.profit          || 0,
    discount:          p.discount        || 0,
    gstPercent:        p.gstPercent      ?? 0,
    cessPercent:       p.cessPercent     ?? 0,
    hsnCode:           p.hsnCode         || "",
    taxType:           p.taxType         || "cgst_sgst",
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
    hsnDescription:    hsnInfo?.description || "",
    hsnCategory:       hsnInfo?.category    || "",
    validTill:         p.validTill,
    status:            p.status,
    createdAt:         p.createdAt,
    updatedAt:         p.updatedAt,
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
    const { code, description, category, gst, cess } = req.body;
    if (!code || !description || !category || gst === undefined)
      return res.status(400).json({ success: false, message: "code, description, category & gst required" });
    const existing = await HsnCode.findOne({ code: code.trim() });
    if (existing) return res.status(409).json({ success: false, message: "HSN already exists" });
    const hsn = await HsnCode.create({
      code:        code.trim(),
      description: description.trim(),
      category:    category.trim(),
      gst:         Number(gst),
      cess:        Number(cess) || 0,
    });
    res.status(201).json({ success: true, data: hsn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const {
      name, brand, category, description, status,mrp,
      basePrice, profit,
      weight, unitConversions, packaging,
      subcategory, subSubCategory,
      gstPercent, cessPercent, hsnCode, taxType, validTill,
    } = req.body;

    // const categoryDoc = await VendorCategory.findById(category);
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc)
      return res.status(400).json({ success: false, message: "Invalid category" });

    const brandDoc = await Brand.findById(brand);
    if (!brandDoc)
      return res.status(400).json({ success: false, message: "Invalid brand" });

    /* Images */
    const mainFile    = req.files?.mainImage?.[0];
    const mainUrl     = mainFile ? await uploadMain(mainFile.buffer) : "";
    const galleryUrls = await uploadManyGallery(req.files?.galleryImages || [], 4);

    /* Weight — optional, null if not provided */
    let parsedWeight = null;
    if (weight) {
      parsedWeight = parseJSON(weight, null);
      if (parsedWeight) {
        if (parsedWeight.unit === "g") parsedWeight.unit = "gm";
        if (!["kg", "gm", "ltr", "ml", "pcs"].includes(parsedWeight.unit))
          parsedWeight.unit = "kg";
        if (!parsedWeight.value || parsedWeight.value <= 0) parsedWeight = null;
      }
    }

    const base      = Number(basePrice) || 0;
    const profitAmt = Number(profit)    || 0;

    /* HSN → resolve GST & CESS */
    const hsnEntry = hsnCode
      ? await HsnCode.findOne({ code: hsnCode.trim(), active: true }).lean()
      : null;

    const gst  = gstPercent  !== undefined && gstPercent  !== "" ? Number(gstPercent)  : (hsnEntry?.gst  ?? 0);
    const cess = cessPercent !== undefined && cessPercent !== "" ? Number(cessPercent) : (hsnEntry?.cess ?? 0);
    const tax  = taxType || "cgst_sgst";

    const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);

    const product = await VendorProduct.create({
      vendor:         req.vendor.id,
      name,
      brand:          brandDoc._id,
      category:       categoryDoc._id,
      subcategory:    parseSub(subcategory)       || { id: null, name: null, image: null },
      subSubCategory: parseSubSub(subSubCategory) || { id: null, name: null, image: null },
      weight:         parsedWeight,
      unitConversions: parseUnitConversions(unitConversions),
      packaging:      parsePackaging(packaging),
      description:    description || "",
      image:          mainUrl,
      galleryImages:  galleryUrls,

      basePrice:  base,
      mrp:
  mrp !== undefined &&
  mrp !== ""
    ? Number(mrp)
    : breakdown.salePrice,
      profit:     profitAmt,
      salePrice:  breakdown.salePrice,
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
      status:    status    || "inactive",
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

    /* populate only valid brand ObjectIds */
    const validProducts = products.filter(
      (p) => p.brand && mongoose.Types.ObjectId.isValid(p.brand)
    );

    const populatedProducts = await Brand.populate(validProducts, {
      path:   "brand",
      select: "name image",
    });

    const hsnMap = await getHsnMap();

    res.json({
      success: true,
      data: populatedProducts.map((p) => buildProduct(p, hsnMap)),
    });
  } catch (err) {
    console.error("getMyProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   GET PRODUCTS TREE
══════════════════════════════════════════════════════════════ */
exports.getVendorProductsTree = async (req, res) => {
  try {
    const vendorId   = req.vendor.id;
    // const categories = await VendorCategory.find({ vendor: vendorId, status: "approved", active: true }).lean();
    const categories = await Category.find().lean();
    const products   = await VendorProduct.find({ vendor: vendorId }).lean();

    const data = categories.map((cat) => ({
      _id:  cat._id,
      name: cat.name,
      image: cat.image,
      subcategories: (cat.subcategories || []).filter((s) => s.active).map((sub) => ({
        _id:  sub._id,
        name: sub.name,
        image: sub.image,
        subSubcategories: (sub.subSubcategories || []).filter((ss) => ss.active).map((ss) => ({
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
   salePrice is ALWAYS recalculated — never manual override
══════════════════════════════════════════════════════════════ */
exports.updateProduct = async (req, res) => {
  try {
    const product = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name, brand, description, status, category,
      weight, unitConversions, packaging,
      subcategory, subSubCategory,
      basePrice, profit,mrp,
      gstPercent, cessPercent, hsnCode, taxType, validTill,
    } = req.body;

    /* Images */
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

    /* Basic fields */
    // if (name        !== undefined) product.name        = name;
    // if (brand       !== undefined) product.brand       = brand;
    // if (description !== undefined) product.description = description;
    // if (status      !== undefined) product.status      = status;
    // if (category    !== undefined) product.category    = category;
    // if (validTill   !== undefined) product.validTill   = validTill || undefined;

    if (name !== undefined) {
  product.name = name;
}

if (brand !== undefined) {
  product.brand = brand;
}

if (description !== undefined) {
  product.description = description;
}

if (status !== undefined) {
  product.status = status;
}

if (category !== undefined) {
  const categoryDoc = await Category.findById(category);

  if (!categoryDoc) {
    return res.status(400).json({
      success: false,
      message: "Invalid category",
    });
  }

  product.category = categoryDoc._id;
}

if (validTill !== undefined) {
  product.validTill = validTill || undefined;
}

    if (subcategory    !== undefined)
      product.subcategory    = parseSub(subcategory)       || { id: null, name: null, image: null };
    if (subSubCategory !== undefined)
      product.subSubCategory = parseSubSub(subSubCategory) || { id: null, name: null, image: null };

    /* Weight — optional, only set if value provided and valid */
    if (weight !== undefined) {
      const w = parseJSON(weight, null);
      if (w && w.value && Number(w.value) > 0) {
        if (w.unit === "g") w.unit = "gm";
        if (!["kg", "gm", "ltr", "ml", "pcs"].includes(w.unit)) w.unit = "kg";
        product.weight = w;
      } else {
        /* empty string or zero value means "clear weight" */
        product.weight = null;
      }
    }

    /* unitConversions */
    if (unitConversions !== undefined)
      product.unitConversions = parseUnitConversions(unitConversions);

    /* packaging */
    if (packaging !== undefined)
      product.packaging = parsePackaging(packaging);

    /* Pricing */
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (mrp !== undefined && mrp !== "") {
  product.mrp = Number(mrp);
}
    if (profit    !== undefined && profit !== "") product.profit = Number(profit);

    /* HSN → resolve GST & CESS */
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

    /* Always recalculate — no manual override */
    const breakdown = calcGstBreakdown(
      Number(product.basePrice),
      Number(product.profit || 0),
      gst, cess,
      product.taxType
    );

    product.salePrice         = breakdown.salePrice;
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
══════════════════════════════════════════════════════════════ */
exports.copyProduct = async (req, res) => {
  try {
    const item = await VendorProduct.findOne({ _id: req.params.id, vendor: req.vendor.id }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Product not found" });

    const breakdown = calcGstBreakdown(
      Number(item.basePrice),
      Number(item.profit      || 0),
      Number(item.gstPercent  || 0),
      Number(item.cessPercent || 0),
      item.taxType || "cgst_sgst"
    );

    const newItem = await VendorProduct.create({
      vendor:          req.vendor.id,
      name:            item.name + " (Copy)",
      brand:           item.brand,
      category:        item.category,
      subcategory:     item.subcategory,
      subSubCategory:  item.subSubCategory,
      weight:          item.weight || null,
      unitConversions: item.unitConversions ? [...item.unitConversions] : [],
      packaging:       item.packaging || { box: 0, packetPerBox: 0, piecePerPacket: 0 },
      description:     item.description || "",
      image:           item.image        || "",
      galleryImages:   item.galleryImages ? [...item.galleryImages] : [],

      basePrice:   item.basePrice,
      mrp:
  item.mrp ||
  breakdown.salePrice,
      profit:      item.profit     || 0,
      salePrice:   breakdown.salePrice,
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
   salePrice always recalculated from GST breakdown
══════════════════════════════════════════════════════════════ */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const hsnMap = await getHsnMap();
    const updated = [];

    for (const p of req.body.products) {
      const item = await VendorProduct.findOne({ _id: p.id, vendor: req.vendor.id });
      if (!item) continue;

      if (p.basePrice   !== undefined) item.basePrice   = Number(p.basePrice);
      if (p.mrp !== undefined) {
  item.mrp = Number(p.mrp);
}
      if (p.profit      !== undefined) item.profit      = Number(p.profit);
      if (p.gstPercent  !== undefined) item.gstPercent  = Number(p.gstPercent);
      if (p.cessPercent !== undefined) item.cessPercent = Number(p.cessPercent);
      if (p.hsnCode     !== undefined) item.hsnCode     = p.hsnCode;
      if (p.taxType     !== undefined) item.taxType     = p.taxType;
      if (p.brand       !== undefined) item.brand       = p.brand;
      if (p.status      !== undefined) item.status      = p.status;

      const breakdown = calcGstBreakdown(
        Number(item.basePrice),
        Number(item.profit      || 0),
        Number(item.gstPercent  || 0),
        Number(item.cessPercent || 0),
        item.taxType || "cgst_sgst"
      );

      item.salePrice         = breakdown.salePrice;
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
        weight:            p.weight ? JSON.stringify(p.weight) : "",
        unitConversions:   JSON.stringify(p.unitConversions || []),
        packaging:         JSON.stringify(p.packaging || {}),
        description:       p.description       || "",
        basePrice:         p.basePrice,
        profit:            p.profit            || 0,
        mrp:               p.mrp || 0,
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
        weight:            p.weight ? JSON.stringify(p.weight) : "",
        unitConversions:   JSON.stringify(p.unitConversions || []),
        packaging:         JSON.stringify(p.packaging || {}),
        description:       p.description       || "",
        basePrice:         p.basePrice,
        profit:            p.profit            || 0,
        mrp:               p.mrp || 0,
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
   salePrice always from breakdown — never from CSV column
══════════════════════════════════════════════════════════════ */
exports.importProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "CSV file required" });

    const rows = [];
    await new Promise((resolve, reject) => {
      csv.parseString(req.file.buffer.toString("utf-8"), { headers: true })
        .on("data", (row) => rows.push(row))
        .on("end",   resolve)
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

        const breakdown = calcGstBreakdown(base, profitAmt, gst, cess, tax);
                const mrp =
  r.mrp &&
  r.mrp !== ""
    ? Number(r.mrp)
    : breakdown.salePrice;
        let weight = null;
        try {
          const w = JSON.parse(r.weight);
          if (w && w.value && Number(w.value) > 0) {
            if (w.unit === "g") w.unit = "gm";
            weight = w;
          }
        } catch {}

        const unitConversionsParsed = parseUnitConversions(r.unitConversions);
        const packagingParsed       = parsePackaging(r.packaging);

        // const cat = await VendorCategory.findOne({ name: r.category?.trim() });

        const cat = await Category.findOne({
  name: r.category?.trim(),
});
        if (!cat) { console.log("Category not found:", r.category); continue; }

        let subCat    = { id: null, name: null, image: null };
        let subSubCat = { id: null, name: null, image: null };
        if (r.subcategory) {
          const sub = cat.subcategories?.find((s) => s.name.toLowerCase() === r.subcategory.trim().toLowerCase());
          if (sub) {
            subCat = { id: sub._id.toString(), name: sub.name, image: sub.image || null };
            if (r.subSubCategory) {
              const ss = sub.subSubcategories?.find((x) => x.name.toLowerCase() === r.subSubCategory.trim().toLowerCase());
              if (ss) subSubCat = { id: ss._id.toString(), name: ss.name, image: ss.image || null };
            }
          }
        }

        const mainUrl     = r.image?.startsWith("http") ? r.image.trim() : "";
        const galleryUrls = r.galleryImages
          ? r.galleryImages.split("|").map((u) => u.trim()).filter((u) => u.startsWith("http")).slice(0, 4)
          : [];

        await VendorProduct.create({
          vendor:          req.vendor.id,
          name:            r.name,
          brand:           r.brand,
          category:        cat._id,
          subcategory:     subCat,
          subSubCategory:  subSubCat,
          weight,
          unitConversions: unitConversionsParsed,
          packaging:       packagingParsed,
          description:     r.description || "",
          image:           mainUrl,
          galleryImages:   galleryUrls,
          basePrice:       base,
          mrp,
          profit:          profitAmt,
          salePrice:       breakdown.salePrice,
          discount:        base > breakdown.salePrice ? base - breakdown.salePrice : 0,
          gstPercent:      gst,
          cessPercent:     cess,
          hsnCode,
          taxType:         tax,
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
          status:            r.status || "inactive",
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

    res.json({ success: true, message: `${fixed} products recalculated.` });
  } catch (err) {
    console.error("fixAllProductPrices error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};