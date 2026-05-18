// const mongoose = require("mongoose");


// const Price         = require("../models/priceModel");    
// const VendorProduct = require("../models/vendorProduct");
// const UnitDef       = require("../models/unitDefModel");

// function statusFilter(status) {
//   if (status === "inactive") return { status: "inactive" };
//   if (status === "all")      return {};
//   return { status: "active" }; // default
// }

// async function fetchUnitDefs() {
//   const defs = await UnitDef.find().lean();
//   return defs?.length ? defs : [{ key: "pcs", label: "Pcs", multiplier: 1 }];
// }
// function pcsToPackaging(pcs, unitDefs) {
//   if (!pcs || !unitDefs?.length) return `${pcs} pcs`;

//   const sorted = [...unitDefs]
//     .filter(u => u.multiplier > 1)
//     .sort((a, b) => b.multiplier - a.multiplier);

//   let remaining = pcs;
//   const parts = [];

//   for (const u of sorted) {
//     const count = Math.floor(remaining / u.multiplier);
//     if (count > 0) {
//       parts.push(`${count} ${u.label}`);
//       remaining %= u.multiplier;
//     }
//   }

//   if (remaining > 0) parts.push(`${remaining} pcs`);

//   return parts.join(" ");
// }

// // function buildAdminProduct(p, unitDefs) {
// //   const weight = p.weight || { value: 1, unit: "kg" };

// //   let packagingText = "";

// //   if (weight.unit === "pcs" && unitDefs?.length) {
// //     packagingText = pcsToPackaging(weight.value, unitDefs);
// //   } else {
// //     packagingText = `${weight.value} ${weight.unit}`;
// //   }

// //   return {
// //     _id:               p._id,
// //     source:            "admin",
// //     adminId:           p._id,
// //     name:              p.name,
// //     brand:             p.brand || "",
// //     category:          p.category || null,
// //     subcategory:       p.subcategory || null,
// //     subSubcategory:    p.subSubcategory || null,
// //     weight,
// //     packagingText, // ✅ ADD
// //     description:       p.description || "",
// //     image:             p.image || "",
// //     galleryImages:     p.galleryImages || [],
// //     basePrice:         p.basePrice || 0,
// //     profitLoss:        p.profitLoss || 0,
// //     salePrice:         p.salePrice || 0,
// //     lockedPrice:       p.lockedPrice || 0,
// //     yesterdayLock:     p.yesterdayLock || 0,
// //     brokerDisplay:     p.brokerDisplay || 0,
// //     gstPercent:        p.gstPercent ?? 0,
// //     cessPercent:       p.cessPercent ?? 0,
// //     hsnCode:           p.hsnCode || "",
// //     taxType:           p.taxType || "cgst_sgst",
// //     priceExcludingGst: p.priceExcludingGst ?? 0,
// //     gstAmount:         p.gstAmount ?? 0,
// //     cgstPercent:       p.cgstPercent ?? 0,
// //     sgstPercent:       p.sgstPercent ?? 0,
// //     igstPercent:       p.igstPercent ?? 0,
// //     cgstAmount:        p.cgstAmount ?? 0,
// //     sgstAmount:        p.sgstAmount ?? 0,
// //     igstAmount:        p.igstAmount ?? 0,
// //     cessAmount:        p.cessAmount ?? 0,
// //     totalTaxAmount:    p.totalTaxAmount ?? 0,
// //     status:            p.status,
// //     createdAt:         p.createdAt,
// //     updatedAt:         p.updatedAt,
// //   };
// // }

// function buildAdminProduct(p, unitDefs) {
//   const weight = p.weight || {
//     value: 1,
//     unit: "kg",
//   };

//   // ✅ Product specific unitDefs
//   const productUnitDefs =
//     Array.isArray(p.unitDefs) &&
//     p.unitDefs.length > 0
//       ? p.unitDefs
//       : unitDefs;

//   let packagingText = "";

//   // ✅ PCS conversion
//   if (
//     weight.unit === "pcs" &&
//     productUnitDefs?.length
//   ) {
//     packagingText = pcsToPackaging(
//       weight.value,
//       productUnitDefs
//     );
//   }

//   // ✅ KG/LTR products
//   else {
//     packagingText = `${weight.value} ${weight.unit}`;
//   }

//   return {
//     _id:               p._id,
//     source:            "admin",
//     adminId:           p._id,
//     name:              p.name,
//     brand:             p.brand || "",
//     category:          p.category || null,
//     subcategory:       p.subcategory || null,
//     subSubcategory:    p.subSubcategory || null,
//     weight,

//     // ✅ IMPORTANT
//     packagingText,

//     unitDefs:
//       productUnitDefs || [],

//     description:       p.description || "",
//     image:             p.image || "",
//     galleryImages:     p.galleryImages || [],
//     basePrice:         p.basePrice || 0,
//     profitLoss:        p.profitLoss || 0,
//     salePrice:         p.salePrice || 0,
//     lockedPrice:       p.lockedPrice || 0,
//     yesterdayLock:     p.yesterdayLock || 0,
//     brokerDisplay:     p.brokerDisplay || 0,
//     gstPercent:        p.gstPercent ?? 0,
//     cessPercent:       p.cessPercent ?? 0,
//     hsnCode:           p.hsnCode || "",
//     taxType:           p.taxType || "cgst_sgst",
//     priceExcludingGst: p.priceExcludingGst ?? 0,
//     gstAmount:         p.gstAmount ?? 0,
//     cgstPercent:       p.cgstPercent ?? 0,
//     sgstPercent:       p.sgstPercent ?? 0,
//     igstPercent:       p.igstPercent ?? 0,
//     cgstAmount:        p.cgstAmount ?? 0,
//     sgstAmount:        p.sgstAmount ?? 0,
//     igstAmount:        p.igstAmount ?? 0,
//     cessAmount:        p.cessAmount ?? 0,
//     totalTaxAmount:    p.totalTaxAmount ?? 0,
//     status:            p.status,
//     createdAt:         p.createdAt,
//     updatedAt:         p.updatedAt,
//   };
// }


// /* ══════════════════════════════════════════════════════════════════════════════
//    SHAPE — Vendor (VendorProduct model)
// ══════════════════════════════════════════════════════════════════════════════ */
// // function buildVendorProduct(p, unitDefs) {
// //   const isPopulated = p.vendor && typeof p.vendor === "object" && p.vendor._id;

// //   const weight = p.weight || { value: 1, unit: "kg" };

// //   let packagingText = "";

// //   if (weight.unit === "pcs" && unitDefs?.length) {
// //     packagingText = pcsToPackaging(weight.value, unitDefs);
// //   } else {
// //     packagingText = `${weight.value} ${weight.unit}`;
// //   }

// //   return {
// //     _id:               p._id,
// //     source:            "vendor",
// //     vendorId:          isPopulated ? p.vendor._id : p.vendor,
// //     vendorInfo:        isPopulated
// //       ? {
// //           _id:   p.vendor._id,
// //           name:  p.vendor.name  || "",
// //           email: p.vendor.email || "",
// //           phone: p.vendor.phone || "",
// //         }
// //       : null,
// //     name:              p.name,
// //     brand:             p.brand || "",
// //     category:          p.category || null,
// //     subcategory:       p.subcategory || null,
// //     subSubCategory:    p.subSubCategory || null,
// //     weight,
// //     packagingText, // ✅ ADD
// //     description:       p.description || "",
// //     image:             p.image || "",
// //     galleryImages:     p.galleryImages || [],
// //     basePrice:         p.basePrice || 0,
// //     profit:            p.profit || 0,
// //     salePrice:         p.salePrice || 0,
// //     discount:          p.discount || 0,
// //     gstPercent:        p.gstPercent ?? 0,
// //     cessPercent:       p.cessPercent ?? 0,
// //     hsnCode:           p.hsnCode || "",
// //     taxType:           p.taxType || "cgst_sgst",
// //     priceExcludingGst: p.priceExcludingGst ?? 0,
// //     gstAmount:         p.gstAmount ?? 0,
// //     cgstPercent:       p.cgstPercent ?? 0,
// //     sgstPercent:       p.sgstPercent ?? 0,
// //     igstPercent:       p.igstPercent ?? 0,
// //     cgstAmount:        p.cgstAmount ?? 0,
// //     sgstAmount:        p.sgstAmount ?? 0,
// //     igstAmount:        p.igstAmount ?? 0,
// //     cessAmount:        p.cessAmount ?? 0,
// //     totalTaxAmount:    p.totalTaxAmount ?? 0,
// //     validTill:         p.validTill || null,
// //     status:            p.status,
// //     createdAt:         p.createdAt,
// //     updatedAt:         p.updatedAt,
// //   };
// // }


// function buildVendorProduct(p, unitDefs) {
//   const isPopulated =
//     p.vendor &&
//     typeof p.vendor === "object" &&
//     p.vendor._id;

//   const weight = p.weight || {
//     value: 1,
//     unit: "kg",
//   };

//   // ✅ Product specific conversions
//   const productUnitDefs =
//     Array.isArray(p.unitConversions) &&
//     p.unitConversions.length > 0
//       ? p.unitConversions.map((u) => ({
//           label: u.unit,
//           multiplier: Number(
//             u.nPcs || 1
//           ),
//         }))
//       : unitDefs;

//   let packagingText = "";

//   // ✅ PCS conversion
//   if (
//     weight.unit === "pcs" &&
//     productUnitDefs?.length
//   ) {
//     packagingText = pcsToPackaging(
//       weight.value,
//       productUnitDefs
//     );
//   }

//   // ✅ KG / GM / LTR products
//   else {
//     packagingText = `${weight.value} ${weight.unit}`;
//   }

//   return {
//     _id: p._id,

//     source: "vendor",

//     vendorId: isPopulated
//       ? p.vendor._id
//       : p.vendor,

//     vendorInfo: isPopulated
//       ? {
//           _id: p.vendor._id,
//           name:
//             p.vendor.name || "",

//           email:
//             p.vendor.email || "",

//           phone:
//             p.vendor.phone || "",
//         }
//       : null,

//     name: p.name,

//     brand:
//       p.brand || "",

//     category:
//       p.category || null,

//     subcategory:
//       p.subcategory || null,

//     subSubCategory:
//       p.subSubCategory || null,

//     weight,

//     // ✅ IMPORTANT
//     packagingText,

//     // ✅ IMPORTANT
//     unitConversions:
//       p.unitConversions || [],

//     // ✅ IMPORTANT
//     unitDefs:
//       productUnitDefs || [],

//     packaging:
//       p.packaging || {},

//     description:
//       p.description || "",

//     image:
//       p.image || "",

//     galleryImages:
//       p.galleryImages || [],

//     basePrice:
//       p.basePrice || 0,

//     profit:
//       p.profit || 0,

//     salePrice:
//       p.salePrice || 0,

//     discount:
//       p.discount || 0,

//     gstPercent:
//       p.gstPercent ?? 0,

//     cessPercent:
//       p.cessPercent ?? 0,

//     hsnCode:
//       p.hsnCode || "",

//     taxType:
//       p.taxType ||
//       "cgst_sgst",

//     priceExcludingGst:
//       p.priceExcludingGst ?? 0,

//     gstAmount:
//       p.gstAmount ?? 0,

//     cgstPercent:
//       p.cgstPercent ?? 0,

//     sgstPercent:
//       p.sgstPercent ?? 0,

//     igstPercent:
//       p.igstPercent ?? 0,

//     cgstAmount:
//       p.cgstAmount ?? 0,

//     sgstAmount:
//       p.sgstAmount ?? 0,

//     igstAmount:
//       p.igstAmount ?? 0,

//     cessAmount:
//       p.cessAmount ?? 0,

//     totalTaxAmount:
//       p.totalTaxAmount ?? 0,

//     validTill:
//       p.validTill || null,

//     status:
//       p.status,

//     createdAt:
//       p.createdAt,

//     updatedAt:
//       p.updatedAt,
//   };
// }




// exports.getAllPublicProducts = async (req, res) => {
//   try {
//     const {
//       source,
//       status   = "active",
//       search,
//       vendorId,
//       page     = 1,
//       limit    = 20,
//     } = req.query;

//     const pageNum  = Math.max(1, parseInt(page)  || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

//     const sf           = statusFilter(status);
//     const searchRegex  = search ? new RegExp(search, "i") : null;

//     // ── Admin query ───────────────────────────────────────────────
//     const adminQuery = { ...sf };
//     if (searchRegex) adminQuery.$or = [{ name: searchRegex }, { brand: searchRegex }];

//     // ── Vendor query ──────────────────────────────────────────────
//     const vendorQuery = { ...sf };
//     if (vendorId) {
//       if (!mongoose.Types.ObjectId.isValid(vendorId))
//         return res.status(400).json({ success: false, message: "Invalid vendorId" });
//       vendorQuery.vendor = new mongoose.Types.ObjectId(vendorId);
//     }
//     if (searchRegex) vendorQuery.$or = [{ name: searchRegex }, { brand: searchRegex }];

//     let adminLimit  = 0;
//     let vendorLimit = 0;

//     if (!source || source === "both") {
//       // Split evenly — admin gets ceil, vendor gets floor
//       adminLimit  = Math.ceil(limitNum / 2);
//       vendorLimit = limitNum - adminLimit;
//     } else if (source === "admin") {
//       adminLimit  = limitNum;
//       vendorLimit = 0;
//     } else if (source === "vendor") {
//       adminLimit  = 0;
//       vendorLimit = limitNum;
//     }

//     const adminSkip  = (pageNum - 1) * adminLimit;
//     const vendorSkip = (pageNum - 1) * vendorLimit;

//     // ── Parallel fetch from both collections ──────────────────────
//     const [
//       adminProducts,
//       adminTotal,
//       vendorProducts,
//       vendorTotal,
//     ] = await Promise.all([
//       adminLimit > 0
//         ? Price.find(adminQuery)
//             .populate("category", "name image")
//             .sort({ createdAt: -1 })
//             .skip(adminSkip)
//             .limit(adminLimit)
//             .lean()
//         : [],

//       adminLimit > 0
//         ? Price.countDocuments(adminQuery)
//         : 0,

//       vendorLimit > 0
//         ? VendorProduct.find(vendorQuery)
//             .populate("category", "name image")
//             .populate("vendor", "name email phone")
//             .sort({ createdAt: -1 })
//             .skip(vendorSkip)
//             .limit(vendorLimit)
//             .lean()
//         : [],

//       vendorLimit > 0
//         ? VendorProduct.countDocuments(vendorQuery)
//         : 0,
//     ]);

    
//  // ✅ ek hi baar fetch karo (loop ke bahar)
// const unitDefs = await fetchUnitDefs();

// const shaped = [];
// const maxLen = Math.max(adminProducts.length, vendorProducts.length);

// for (let i = 0; i < maxLen; i++) {
//   const adminItem = adminProducts[i];
//   const vendorItem = vendorProducts[i];

//   if (adminItem) {
//     shaped.push(buildAdminProduct(adminItem, unitDefs)); // ✅ FIX
//   }

//   if (vendorItem) {
//     shaped.push(buildVendorProduct(vendorItem, unitDefs)); // ✅ FIX
//   }
// }
//     const totalPages = Math.max(
//       adminLimit  > 0 ? Math.ceil(adminTotal  / adminLimit)  : 0,
//       vendorLimit > 0 ? Math.ceil(vendorTotal / vendorLimit) : 0,
//     );

//     return res.json({
//       success: true,
//       total: adminTotal + vendorTotal,
//       page:   pageNum,
//       limit:  limitNum,
//       pages:  totalPages,
//       counts: {
//         admin:  adminTotal,
//         vendor: vendorTotal,
//       },
//       data: shaped,
//     });
//   } catch (err) {
//     console.error("getAllPublicProducts error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


// exports.getAdminPublicProducts = async (req, res) => {
//   try {
//     const {
//       status = "active",
//       search,
//       page   = 1,
//       limit  = 20,
//     } = req.query;

//     const pageNum  = Math.max(1, parseInt(page)  || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
//     const skip     = (pageNum - 1) * limitNum;

//     const query = { ...statusFilter(status) };
//     if (search) {
//       const rx = new RegExp(search, "i");
//       query.$or = [{ name: rx }, { brand: rx }];
//     }

//     const [products, total] = await Promise.all([
//       Price.find(query)
//         .populate("category", "name image")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Price.countDocuments(query),
//     ]);

//  const unitDefs = await fetchUnitDefs(); // ✅ ADD

// return res.json({
//   success: true,
//   total,
//   page:   pageNum,
//   limit:  limitNum,
//   pages:  Math.ceil(total / limitNum),
//   data:   products.map(p => buildAdminProduct(p, unitDefs)), // ✅ FIX
// });
//   } catch (err) {
//     console.error("getAdminPublicProducts error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getVendorPublicProducts = async (req, res) => {
//   try {
//     const {
//       vendorId,
//       status = "active",
//       search,
//       page   = 1,
//       limit  = 20,
//     } = req.query;

//     const pageNum  = Math.max(1, parseInt(page)  || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
//     const skip     = (pageNum - 1) * limitNum;

//     const query = { ...statusFilter(status) };

//     if (vendorId) {
//       if (!mongoose.Types.ObjectId.isValid(vendorId))
//         return res.status(400).json({ success: false, message: "Invalid vendorId" });
//       query.vendor = new mongoose.Types.ObjectId(vendorId);
//     }

//     if (search) {
//       const rx = new RegExp(search, "i");
//       query.$or = [{ name: rx }, { brand: rx }];
//     }

//     const [products, total] = await Promise.all([
//       VendorProduct.find(query)
//         .populate("category", "name image")
//         .populate("vendor", "name email phone")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       VendorProduct.countDocuments(query),
//     ]);

//   const unitDefs = await fetchUnitDefs(); // ✅ ADD

// return res.json({
//   success: true,
//   total,
//   page:   pageNum,
//   limit:  limitNum,
//   pages:  Math.ceil(total / limitNum),
//   data:   products.map(p => buildVendorProduct(p, unitDefs)), // ✅ FIX
// });
//   } catch (err) {
//     console.error("getVendorPublicProducts error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getPublicProductById = async (req, res) => {
//   try {
//     const { id }     = req.params;
//     const { source } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ success: false, message: "Invalid product id" });

//    if (!source || source === "admin") {
//   const p = await Price.findById(id)
//     .populate("category", "name image")
//     .lean();

//   if (p) {
//     const unitDefs = await fetchUnitDefs(); // ✅ ADD
//     return res.json({
//       success: true,
//       data: buildAdminProduct(p, unitDefs) // ✅ FIX
//     });
//   }
// }

//     if (!source || source === "vendor") {
//   const p = await VendorProduct.findById(id)
//     .populate("category", "name image")
//     .populate("vendor", "name email phone")
//     .lean();

//   if (p) {
//     const unitDefs = await fetchUnitDefs(); // ✅ ADD
//     return res.json({
//       success: true,
//       data: buildVendorProduct(p, unitDefs) // ✅ FIX
//     });
//   }
// }

//     return res.status(404).json({ success: false, message: "Product not found" });
//   } catch (err) {
//     console.error("getPublicProductById error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


// exports.getPublicProductsTree = async (req, res) => {
//   try {
//     const { source, status = "active" } = req.query;
//     const sf = statusFilter(status);

  
//     let adminTree = [];
//     if (!source || source === "admin") {
//       const products = await Price.find(sf)
//         .populate("category", "name image")
//         .lean();

//       const catMap = {};
//       const unitDefs = await fetchUnitDefs();
//       for (const p of products) {
//         if (!p.category?._id) continue;
//         const catId  = String(p.category._id);
//         const subKey = p.subcategory?.id    || "NO_SUB";
//         const ssKey  = p.subSubcategory?.id || "NO_SUBSUB";

//         catMap[catId] ??= {
//           _id: p.category._id, name: p.category.name,
//           image: p.category.image || "", source: "admin", subcategories: {},
//         };
//         catMap[catId].subcategories[subKey] ??= {
//           id: p.subcategory?.id || null, name: p.subcategory?.name || "Others",
//           image: p.subcategory?.image || "", subSubcategories: {},
//         };
//         catMap[catId].subcategories[subKey].subSubcategories[ssKey] ??= {
//           id: p.subSubcategory?.id || null, name: p.subSubcategory?.name || "General",
//           image: p.subSubcategory?.image || "", products: [],
//         };
//         catMap[catId].subcategories[subKey].subSubcategories[ssKey].products.push(
//          buildAdminProduct(p, unitDefs)
//         );
//       }

//       adminTree = Object.values(catMap).map((c) => ({
//         ...c,
//         subcategories: Object.values(c.subcategories).map((s) => ({
//           ...s,
//           subSubcategories: Object.values(s.subSubcategories),
//         })),
//       }));
//     }

   
//     let vendorTree = [];
//     if (!source || source === "vendor") {
//       const products = await VendorProduct.find(sf)
//         .populate("category", "name image")
//         .populate("vendor", "name email phone")
//         .lean();

//       const catMap = {};
//       const unitDefs = await fetchUnitDefs();
      
//       for (const p of products) {
//         if (!p.category?._id) continue;
//         const catId  = String(p.category._id);
//         const subKey = p.subcategory?.id      || "NO_SUB";
//         const ssKey  = p.subSubCategory?.id   || "NO_SUBSUB";

//         catMap[catId] ??= {
//           _id: p.category._id, name: p.category.name,
//           image: p.category.image || "", source: "vendor", subcategories: {},
//         };
//         catMap[catId].subcategories[subKey] ??= {
//           id: p.subcategory?.id || null, name: p.subcategory?.name || "Others",
//           image: p.subcategory?.image || "", subSubcategories: {},
//         };
//         catMap[catId].subcategories[subKey].subSubcategories[ssKey] ??= {
//           id: p.subSubCategory?.id || null, name: p.subSubCategory?.name || "General",
//           image: p.subSubCategory?.image || "", products: [],
//         };
//         catMap[catId].subcategories[subKey].subSubcategories[ssKey].products.push(
//           buildVendorProduct(p, unitDefs)
//         );
//       }

//       vendorTree = Object.values(catMap).map((c) => ({
//         ...c,
//         subcategories: Object.values(c.subcategories).map((s) => ({
//           ...s,
//           subSubcategories: Object.values(s.subSubcategories),
//         })),
//       }));
//     }

//     return res.json({
//       success: true,
//       data: { admin: adminTree, vendor: vendorTree },
//     });
//   } catch (err) {
//     console.error("getPublicProductsTree error:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };
const mongoose = require("mongoose");


const Price         = require("../models/priceModel");    
const VendorProduct = require("../models/vendorProduct");
const UnitDef       = require("../models/unitDefModel");
// const Vendor        = require("../models/Vendor");

function statusFilter(status) {
  if (status === "inactive") return { status: "inactive" };
  if (status === "all")      return {};
  return { status: "active" }; // default
}

async function fetchUnitDefs() {
  const defs = await UnitDef.find().lean();
  return defs?.length ? defs : [{ key: "pcs", label: "Pcs", multiplier: 1 }];
}
function pcsToPackaging(pcs, unitDefs) {
  if (!pcs || !unitDefs?.length) return `${pcs} pcs`;

  const sorted = [...unitDefs]
    .filter(u => u.multiplier > 1)
    .sort((a, b) => b.multiplier - a.multiplier);

  let remaining = pcs;
  const parts = [];

  for (const u of sorted) {
    const count = Math.floor(remaining / u.multiplier);
    if (count > 0) {
      parts.push(`${count} ${u.label}`);
      remaining %= u.multiplier;
    }
  }

  if (remaining > 0) parts.push(`${remaining} pcs`);

  return parts.join(" ");
}

function buildAdminProduct(p, unitDefs) {
  const weight = p.weight || {
    value: 1,
    unit: "kg",
  };

  // ✅ Product specific unitDefs
  const productUnitDefs =
    Array.isArray(p.unitDefs) &&
    p.unitDefs.length > 0
      ? p.unitDefs
      : unitDefs;

  let packagingText = "";

  // ✅ PCS conversion
  if (
    weight.unit === "pcs" &&
    productUnitDefs?.length
  ) {
    packagingText = pcsToPackaging(
      weight.value,
      productUnitDefs
    );
  }

  // ✅ KG/LTR products
  else {
    packagingText = `${weight.value} ${weight.unit}`;
  }

  return {
    _id:               p._id,
    source:            "admin",
    adminId:           p._id,
    name:              p.name,
    brand:             p.brand || "",
    category:          p.category || null,
    subcategory:       p.subcategory || null,
    subSubcategory:    p.subSubcategory || null,
    weight,

    // ✅ IMPORTANT
    packagingText,

    unitDefs:
      productUnitDefs || [],

    description:       p.description || "",
    image:             p.image || "",
    galleryImages:     p.galleryImages || [],
    basePrice:         p.basePrice || 0,
    profitLoss:        p.profitLoss || 0,
    salePrice:         p.salePrice || 0,
    mrp:           p.mrp || 0,
    lockedPrice:       p.lockedPrice || 0,
    yesterdayLock:     p.yesterdayLock || 0,
    brokerDisplay:     p.brokerDisplay || 0,
    gstPercent:        p.gstPercent ?? 0,
    cessPercent:       p.cessPercent ?? 0,
    hsnCode:           p.hsnCode || "",
    taxType:           p.taxType || "cgst_sgst",
    priceExcludingGst: p.priceExcludingGst ?? 0,
    gstAmount:         p.gstAmount ?? 0,
    cgstPercent:       p.cgstPercent ?? 0,
    sgstPercent:       p.sgstPercent ?? 0,
    igstPercent:       p.igstPercent ?? 0,
    cgstAmount:        p.cgstAmount ?? 0,
    sgstAmount:        p.sgstAmount ?? 0,
    igstAmount:        p.igstAmount ?? 0,
    cessAmount:        p.cessAmount ?? 0,
    totalTaxAmount:    p.totalTaxAmount ?? 0,
    status:            p.status,
    createdAt:         p.createdAt,
    updatedAt:         p.updatedAt,
  };
}

function buildVendorProduct(p, unitDefs) {
  const isPopulated =
    p.vendor &&
    typeof p.vendor === "object" &&
    p.vendor._id;

  const weight = p.weight || {
    value: 1,
    unit: "kg",
  };

  // ✅ Product specific conversions
  const productUnitDefs =
    Array.isArray(p.unitConversions) &&
    p.unitConversions.length > 0
      ? p.unitConversions.map((u) => ({
          label: u.unit,
          multiplier: Number(
            u.nPcs || 1
          ),
        }))
      : unitDefs;

  let packagingText = "";

  // ✅ PCS conversion
  if (
    weight.unit === "pcs" &&
    productUnitDefs?.length
  ) {
    packagingText = pcsToPackaging(
      weight.value,
      productUnitDefs
    );
  }

  // ✅ KG / GM / LTR products
  else {
    packagingText = `${weight.value} ${weight.unit}`;
  }

  return {
    _id: p._id,

    source: "vendor",

    vendorId: isPopulated
      ? p.vendor._id
      : p.vendor,

    vendorInfo: isPopulated
      ? {
          _id: p.vendor._id,
          name:
            p.vendor.name || "",

          email:
            p.vendor.email || "",

          phone:
            p.vendor.phone || "",
        }
      : null,

    name: p.name,

    brand:
      p.brand || "",

    category:
      p.category || null,

    subcategory:
      p.subcategory || null,

    subSubCategory:
      p.subSubCategory || null,

    weight,

    // ✅ IMPORTANT
    packagingText,

    // ✅ IMPORTANT
    unitConversions:
      p.unitConversions || [],

    // ✅ IMPORTANT
    unitDefs:
      productUnitDefs || [],

    packaging:
      p.packaging || {},

    description:
      p.description || "",

    image:
      p.image || "",

    galleryImages:
      p.galleryImages || [],

    basePrice:
      p.basePrice || 0,

    profit:
      p.profit || 0,

    salePrice:
      p.salePrice || 0,


      mrp:
      p.mrp ||0,

    discount:
      p.discount || 0,

    gstPercent:
      p.gstPercent ?? 0,

    cessPercent:
      p.cessPercent ?? 0,

    hsnCode:
      p.hsnCode || "",

    taxType:
      p.taxType ||
      "cgst_sgst",

    priceExcludingGst:
      p.priceExcludingGst ?? 0,

    gstAmount:
      p.gstAmount ?? 0,

    cgstPercent:
      p.cgstPercent ?? 0,

    sgstPercent:
      p.sgstPercent ?? 0,

    igstPercent:
      p.igstPercent ?? 0,

    cgstAmount:
      p.cgstAmount ?? 0,

    sgstAmount:
      p.sgstAmount ?? 0,

    igstAmount:
      p.igstAmount ?? 0,

    cessAmount:
      p.cessAmount ?? 0,

    totalTaxAmount:
      p.totalTaxAmount ?? 0,

    validTill:
      p.validTill || null,

    status:
      p.status,

    createdAt:
      p.createdAt,

    updatedAt:
      p.updatedAt,
  };
}




exports.getAllPublicProducts = async (req, res) => {
  try {
    const {
      source,
      status   = "active",
      search,
      vendorId,
      page     = 1,
      limit    = 20,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const sf           = statusFilter(status);
    const searchRegex  = search ? new RegExp(search, "i") : null;

    // ── Admin query ───────────────────────────────────────────────
    const adminQuery = { ...sf };
    if (searchRegex) adminQuery.$or = [{ name: searchRegex }, { brand: searchRegex }];

    // ── Vendor query ──────────────────────────────────────────────
    const vendorQuery = { ...sf };
    if (vendorId) {
      if (!mongoose.Types.ObjectId.isValid(vendorId))
        return res.status(400).json({ success: false, message: "Invalid vendorId" });
      vendorQuery.vendor = new mongoose.Types.ObjectId(vendorId);
    }
    if (searchRegex) vendorQuery.$or = [{ name: searchRegex }, { brand: searchRegex }];

    let adminLimit  = 0;
    let vendorLimit = 0;

    if (!source || source === "both") {
      // Split evenly — admin gets ceil, vendor gets floor
      adminLimit  = Math.ceil(limitNum / 2);
      vendorLimit = limitNum - adminLimit;
    } else if (source === "admin") {
      adminLimit  = limitNum;
      vendorLimit = 0;
    } else if (source === "vendor") {
      adminLimit  = 0;
      vendorLimit = limitNum;
    }

    const adminSkip  = (pageNum - 1) * adminLimit;
    const vendorSkip = (pageNum - 1) * vendorLimit;

    // ── Parallel fetch from both collections ──────────────────────
    const [
      adminProducts,
      adminTotal,
      vendorProducts,
      vendorTotal,
    ] = await Promise.all([
      adminLimit > 0
        ? Price.find(adminQuery)
            .populate("category", "name image")
            .sort({ createdAt: -1 })
            .skip(adminSkip)
            .limit(adminLimit)
            .lean()
        : [],

      adminLimit > 0
        ? Price.countDocuments(adminQuery)
        : 0,

      // vendorLimit > 0
      //   ? VendorProduct.find(vendorQuery)
      //       .populate("category", "name image")
      //       .populate("vendor", "name email phone")
      //       .sort({ createdAt: -1 })
      //       .skip(vendorSkip)
      //       .limit(vendorLimit)
      //       .lean()
      //   : [],
vendorLimit > 0
  ? VendorProduct.find(vendorQuery)
      .populate("category", "name image")
      .populate({
        path: "vendor",
        select: "name email phone status",
        match: {
          status: "APPROVED",
        },
      })
      .sort({ createdAt: -1 })
      .skip(vendorSkip)
      .limit(vendorLimit)
      .lean()
  : [],
      vendorLimit > 0
        ? VendorProduct.countDocuments(vendorQuery)
        : 0,
    ]);

    
 // ✅ ek hi baar fetch karo (loop ke bahar)
const unitDefs = await fetchUnitDefs();

// const shaped = [];
// const maxLen = Math.max(adminProducts.length, vendorProducts.length);

const approvedVendorProducts = vendorProducts.filter(
  (item) => item.vendor !== null
);
const approvedVendorTotal = approvedVendorProducts.length;
const shaped = [];

const maxLen = Math.max(
  adminProducts.length,
  approvedVendorProducts.length
);

for (let i = 0; i < maxLen; i++) {
  const adminItem = adminProducts[i];
  // const vendorItem = vendorProducts[i];
  const vendorItem = approvedVendorProducts[i];

  if (adminItem) {
    shaped.push(buildAdminProduct(adminItem, unitDefs)); // ✅ FIX
  }

  if (vendorItem) {
    shaped.push(buildVendorProduct(vendorItem, unitDefs)); // ✅ FIX
  }
}
    // const totalPages = Math.max(
    //   adminLimit  > 0 ? Math.ceil(adminTotal  / adminLimit)  : 0,
    //   vendorLimit > 0 ? Math.ceil(vendorTotal / vendorLimit) : 0,
    // );
    const totalPages = Math.ceil(
  (adminTotal + approvedVendorTotal) / limitNum
);
    return res.json({
      success: true,
      // total: adminTotal + vendorTotal,
      total: adminTotal + approvedVendorTotal,
      page:   pageNum,
      limit:  limitNum,
      pages:  totalPages,
      counts: {
        admin:  adminTotal,
        // vendor: vendorTotal,
        vendor: approvedVendorTotal,
      },
      data: shaped,
    });
  } catch (err) {
    console.error("getAllPublicProducts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAdminPublicProducts = async (req, res) => {
  try {
    const {
      status = "active",
      search,
      page   = 1,
      limit  = 20,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const query = { ...statusFilter(status) };
    if (search) {
      const rx = new RegExp(search, "i");
      query.$or = [{ name: rx }, { brand: rx }];
    }

    const [products, total] = await Promise.all([
      Price.find(query)
        .populate("category", "name image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Price.countDocuments(query),
    ]);

 const unitDefs = await fetchUnitDefs(); // ✅ ADD

return res.json({
  success: true,
  total,
  page:   pageNum,
  limit:  limitNum,
  pages:  Math.ceil(total / limitNum),
  data:   products.map(p => buildAdminProduct(p, unitDefs)), // ✅ FIX
});
  } catch (err) {
    console.error("getAdminPublicProducts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVendorPublicProducts = async (req, res) => {
  try {
    const {
      vendorId,
      status = "active",
      search,
      page   = 1,
      limit  = 20,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const query = { ...statusFilter(status) };

    if (vendorId) {
      if (!mongoose.Types.ObjectId.isValid(vendorId))
        return res.status(400).json({ success: false, message: "Invalid vendorId" });
      query.vendor = new mongoose.Types.ObjectId(vendorId);
    }

    if (search) {
      const rx = new RegExp(search, "i");
      query.$or = [{ name: rx }, { brand: rx }];
    }

    const [products, total] = await Promise.all([
      VendorProduct.find(query)
        .populate("category", "name image")
        // .populate("vendor", "name email phone")
        .populate({
  path: "vendor",
  select: "name email phone status",
  match: {
    status: "APPROVED",
  },
})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      VendorProduct.countDocuments(query),
    ]);

  const unitDefs = await fetchUnitDefs(); // ✅ ADD


const approvedProducts = products.filter(
  (p) => p.vendor !== null
);
return res.json({
  success: true,
  total: approvedProducts.length,
  page:   pageNum,
  limit:  limitNum,
  pages:  Math.ceil(total / limitNum),
  // data:   products.map(p => buildVendorProduct(p, unitDefs)), 
 data: approvedProducts.map((p) =>
  buildVendorProduct(p, unitDefs)
),
});
  } catch (err) {
    console.error("getVendorPublicProducts error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPublicProductById = async (req, res) => {
  try {
    const { id }     = req.params;
    const { source } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid product id" });

   if (!source || source === "admin") {
  const p = await Price.findById(id)
    .populate("category", "name image")
    .lean();

  if (p) {
    const unitDefs = await fetchUnitDefs(); // ✅ ADD
    return res.json({
      success: true,
      data: buildAdminProduct(p, unitDefs) // ✅ FIX
    });
  }
}

    if (!source || source === "vendor") {
  const p = await VendorProduct.findById(id)
    .populate("category", "name image")
    // .populate("vendor", "name email phone")
    .populate({
  path: "vendor",
  select: "name email phone status",
  match: {
    status: "APPROVED",
  },
})
    .lean();

 if (p && p.vendor) {
    const unitDefs = await fetchUnitDefs(); // ✅ ADD
    return res.json({
      success: true,
      data: buildVendorProduct(p, unitDefs) // ✅ FIX
    });
  }
}

    return res.status(404).json({ success: false, message: "Product not found" });
  } catch (err) {
    console.error("getPublicProductById error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.getPublicProductsTree = async (req, res) => {
  try {
    const { source, status = "active" } = req.query;
    const sf = statusFilter(status);

  
    let adminTree = [];
    if (!source || source === "admin") {
      const products = await Price.find(sf)
        .populate("category", "name image")
        .lean();

      const catMap = {};
      const unitDefs = await fetchUnitDefs();
      for (const p of products) {
        if (!p.category?._id) continue;
        const catId  = String(p.category._id);
        const subKey = p.subcategory?.id    || "NO_SUB";
        const ssKey  = p.subSubcategory?.id || "NO_SUBSUB";

        catMap[catId] ??= {
          _id: p.category._id, name: p.category.name,
          image: p.category.image || "", source: "admin", subcategories: {},
        };
        catMap[catId].subcategories[subKey] ??= {
          id: p.subcategory?.id || null, name: p.subcategory?.name || "Others",
          image: p.subcategory?.image || "", subSubcategories: {},
        };
        catMap[catId].subcategories[subKey].subSubcategories[ssKey] ??= {
          id: p.subSubcategory?.id || null, name: p.subSubcategory?.name || "General",
          image: p.subSubcategory?.image || "", products: [],
        };
        catMap[catId].subcategories[subKey].subSubcategories[ssKey].products.push(
         buildAdminProduct(p, unitDefs)
        );
      }

      adminTree = Object.values(catMap).map((c) => ({
        ...c,
        subcategories: Object.values(c.subcategories).map((s) => ({
          ...s,
          subSubcategories: Object.values(s.subSubcategories),
        })),
      }));
    }

   
    let vendorTree = [];
    if (!source || source === "vendor") {
      const products = await VendorProduct.find(sf)
        .populate("category", "name image")
        // .populate("vendor", "name email phone")
        .populate({
  path: "vendor",
  select: "name email phone status",
  match: {
    status: "APPROVED",
  },
})
        .lean();

      const catMap = {};
      const unitDefs = await fetchUnitDefs();
      
      for (const p of products) {
          if (!p.vendor) continue;
        if (!p.category?._id) continue;
        const catId  = String(p.category._id);
        const subKey = p.subcategory?.id      || "NO_SUB";
        const ssKey  = p.subSubCategory?.id   || "NO_SUBSUB";

        catMap[catId] ??= {
          _id: p.category._id, name: p.category.name,
          image: p.category.image || "", source: "vendor", subcategories: {},
        };
        catMap[catId].subcategories[subKey] ??= {
          id: p.subcategory?.id || null, name: p.subcategory?.name || "Others",
          image: p.subcategory?.image || "", subSubcategories: {},
        };
        catMap[catId].subcategories[subKey].subSubcategories[ssKey] ??= {
          id: p.subSubCategory?.id || null, name: p.subSubCategory?.name || "General",
          image: p.subSubCategory?.image || "", products: [],
        };
        catMap[catId].subcategories[subKey].subSubcategories[ssKey].products.push(
          buildVendorProduct(p, unitDefs)
        );
      }

      vendorTree = Object.values(catMap).map((c) => ({
        ...c,
        subcategories: Object.values(c.subcategories).map((s) => ({
          ...s,
          subSubcategories: Object.values(s.subSubcategories),
        })),
      }));
    }

    return res.json({
      success: true,
      data: { admin: adminTree, vendor: vendorTree },
    });
  } catch (err) {
    console.error("getPublicProductsTree error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};