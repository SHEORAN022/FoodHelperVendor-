
// const Order = require("../models/Order");
// const Price = require("../models/priceModel");
// const VendorProduct = require("../models/vendorProduct");
// const User = require("../models/User");
// const Rider = require("../models/Rider");
// const Inventory = require("../models/Inventory");
// const Ledger = require("../models/Inventoryledger");

// const deductStock = async (items, orderId, note = "Order placed") => {
//   for (const item of items) {
//     const inv = await Inventory.findOne({ product: item.product });
//     if (!inv) continue;
//     inv.stock = Math.max(0, inv.stock - item.quantity);
//     await inv.save();
//     await Ledger.create({
//       product: item.product,
//       type: "OUTWARD",
//       qty: item.quantity,
//       note: `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`
//     });
//   }
// };

// const restoreStock = async (items, orderId, note = "Order cancelled") => {
//   for (const item of items) {
//     const inv = await Inventory.findOne({ product: item.product });
//     if (!inv) continue;
//     inv.stock = inv.stock + item.quantity;
//     await inv.save();
//     await Ledger.create({
//       product: item.product,
//       type: "INWARD",
//       qty: item.quantity,
//       note: `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`
//     });
//   }
// };

// const resolveItems = async (rawItems) => {
//   if (!Array.isArray(rawItems) || rawItems.length === 0)
//     throw { status: 400, message: "Items array required aur empty nahi hona chahiye" };

//   const resolved = await Promise.all(
//     rawItems.map(async (it, idx) => {
//       if (!it.productId)
//         throw { status: 400, message: `Item ${idx + 1}: productId missing hai` };

//       const qty = Number(it.quantity);
//       if (!Number.isInteger(qty) || qty < 1)
//         throw { status: 400, message: `Item ${idx + 1}: quantity valid nahi hai (min 1)` };

//       let product;
//       let ownerType;
//       let vendorId = null;
//       let productModel;

//       if (it.type === "admin") {
//         product = await Price.findById(it.productId);
//         ownerType = "admin";
//         productModel = "Price";
//       } else if (it.type === "vendor") {
//         product = await VendorProduct.findById(it.productId);
//         ownerType = "vendor";
//         productModel = "VendorProduct";
//         vendorId = product?.vendor;
//       } else {
//         throw { status: 400, message: `Item ${idx + 1}: type invalid hai` };
//       }

//       if (!product)
//         throw { status: 404, message: `Product nahi mila: ${it.productId}` };

//       if (product.status !== "active")
//         throw { status: 400, message: `Product active nahi hai: ${product.name}` };

//       const unitPrice = product.salePrice || product.price;

//       return {
//         product: product._id,
//         name: product.name,
//         image: product.image || "",
//         unitPrice,
//         quantity: qty,
//         price: +(unitPrice * qty).toFixed(2),
//         ownerType,
//         vendorId,
//         productModel
//       };
//     })
//   );

//   const totalPrice = +resolved.reduce((sum, i) => sum + i.price, 0).toFixed(2);
//   return { resolved, totalPrice };
// };

// exports.createOrder = async (req, res) => {
//   try {
//     const { items, address } = req.body;
//     const user = await User.findById(req.user.id);

//     if (!user)
//       return res.status(404).json({ success: false, message: "User not found" });

//     const { resolved, totalPrice } = await resolveItems(items);

//     const order = await Order.create({
//       user: user._id,
//       userName: user.name || user.email,
//       items: resolved,
//       totalPrice,
//       address,
//       paidAmount: 0,
//       paymentStatus: "unpaid"
//     });

//     await deductStock(resolved, order._id);

//     return res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       data: order
//     });

//   } catch (err) {
//     if (err.status)
//       return res.status(err.status).json({ success: false, message: err.message });

//     return res.status(500).json({
//       success: false,
//       message: "Order place karna fail ho gaya"
//     });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const allowed = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
//     if (!allowed.includes(status))
//       return res.status(400).json({ success: false, message: "Invalid status value" });

//     const order = await Order.findById(req.params.id);
//     if (!order)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     const prevStatus = order.status;

//     if (status === "cancelled" && prevStatus !== "cancelled")
//       await restoreStock(order.items, order._id);

//     if (prevStatus === "cancelled" && status !== "cancelled")
//       await deductStock(order.items, order._id);

//     order.status = status;
//     await order.save();

//     return res.json({ success: true, data: order });

//   } catch (err) {
//     return res.status(500).json({ success: false, message: "Status update fail ho gaya" });
//   }
// };

// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
//     return res.json({ success: true, data: orders });
//   } catch {
//     return res.status(500).json({ success: false, message: "Fetch fail" });
//   }
// };

// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     return res.json({ success: true, data: orders });
//   } catch {
//     return res.status(500).json({ success: false, message: "Fetch fail" });
//   }
// };

// exports.assignRider = async (req, res) => {
//   try {
//     const { riderId } = req.body;

//     if (riderId) {
//       const rider = await Rider.findById(riderId);
//       if (!rider)
//         return res.status(404).json({ success: false, message: "Rider not found" });
//     }

//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       { assignedRider: riderId || null },
//       { new: true }
//     );

//     return res.json({ success: true, data: order });

//   } catch {
//     return res.status(500).json({ success: false, message: "Assign fail" });
//   }
// };

// exports.updateOrderItems = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);

//     if (!order)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     const oldItems = order.items;
//     const { resolved, totalPrice } = await resolveItems(req.body.items);

//     if (order.status !== "cancelled") {
//       await restoreStock(oldItems, order._id);
//       await deductStock(resolved, order._id);
//     }

//     order.items = resolved;
//     order.totalPrice = totalPrice;

//     if (order.paidAmount > totalPrice)
//       order.paidAmount = totalPrice;

//     await order.save();

//     return res.json({
//       success: true,
//       message: "Order updated",
//       data: order
//     });

//   } catch (err) {
//     if (err.status)
//       return res.status(err.status).json({ success: false, message: err.message });

//     return res.status(500).json({
//       success: false,
//       message: "Order update fail"
//     });
//   }
// };

// exports.updatePayment = async (req, res) => {
//   try {
//     const { paidAmount, paymentNote } = req.body;

//     if (paidAmount === undefined)
//       return res.status(400).json({ success: false, message: "paidAmount required" });

//     const order = await Order.findById(req.params.id);

//     if (!order)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     order.paidAmount = Math.min(Number(paidAmount), order.totalPrice);

//     if (paymentNote !== undefined)
//       order.paymentNote = paymentNote;

//     await order.save();

//     return res.json({
//       success: true,
//       data: order
//     });

//   } catch {
//     return res.status(500).json({
//       success: false,
//       message: "Payment update fail"
//     });
//   }
// };




const Order         = require("../models/Order");
const Price         = require("../models/priceModel");
const VendorProduct = require("../models/vendorProduct");
const User          = require("../models/User");
const Rider         = require("../models/Rider");
const Inventory     = require("../models/Inventory");
const Ledger        = require("../models/inventoryledger");
const Coupon        = require("../models/couponModel");
const UnitDef       = require("../models/unitDefModel");


// ─── GLOBAL UNIT DEFS FETCH (sirf fallback ke liye) ──────────────────────────
async function fetchUnitDefs() {
  const defs = await UnitDef.find().lean();
  return defs?.length ? defs : [{ key: "pcs", label: "Pcs", multiplier: 1 }];
}


// function pcsToPackaging(qty, unitDefs) {
//   if (!qty || qty <= 0) return `${qty} pcs`;

//   // Sirf woh units lo jinका multiplier > 1 hain, descending sort karo
//   const sorted = [...unitDefs]
//     .filter((u) => u.multiplier > 1)
//     .sort((a, b) => b.multiplier - a.multiplier);

//   // Agar koi conversion define nahi to sirf qty pcs
//   if (sorted.length === 0) return `${qty} pcs`;

//   let remaining = qty;
//   const parts   = [];

//   for (const u of sorted) {
//     const count = Math.floor(remaining / u.multiplier);
//     if (count > 0) {
//       parts.push(`${count} ${u.label}`);
//       remaining = remaining % u.multiplier;
//     }
//   }

//   // Jo bache woh pcs mein
//   if (remaining > 0) parts.push(`${remaining} pcs`);

//   return parts.join(" ");
// }

function pcsToPackaging(
  qty,
  unitDefs = []
) {
  qty = Number(qty || 0);

  // ✅ INVALID QTY
  if (qty <= 0) {
    return "0 pcs";
  }

  // ✅ NORMALIZE DEFINITIONS
  const normalized =
    (Array.isArray(unitDefs)
      ? unitDefs
      : []
    )
      .map((u) => ({
        label: String(
          u.label ||
          u.unit ||
          "pcs"
        ).trim(),

        multiplier: Number(
          u.multiplier ||
          u.nPcs ||
          1
        ),
      }))

      // ✅ IGNORE PCS
      .filter(
        (u) =>
          u.multiplier > 1
      )

      // ✅ BIGGEST FIRST
      .sort(
        (a, b) =>
          b.multiplier -
          a.multiplier
      );

  // ✅ NO CONVERSIONS
  if (!normalized.length) {
    return `${qty} pcs`;
  }

  let remaining = qty;

  const parts = [];

  // ✅ CONVERT
  for (const u of normalized) {
    const count = Math.floor(
      remaining / u.multiplier
    );

    if (count > 0) {
      parts.push(
        `${count} ${u.label}`
      );

      remaining =
        remaining %
        u.multiplier;
    }
  }

  // ✅ LEFTOVER PCS
  if (remaining > 0) {
    parts.push(
      `${remaining} pcs`
    );
  }

  return parts.join(" ");
}

function weightToText(weight) {
  if (!weight) return "";
  return `${weight.value} ${weight.unit}`;
}

// ─── STOCK HELPERS ────────────────────────────────────────────────────────────
const deductStock = async (items, orderId, note = "Order placed") => {
  for (const item of items) {
    const inv = await Inventory.findOne({ product: item.product });
    if (!inv) continue;
    inv.stock = Math.max(0, inv.stock - item.quantity);
    await inv.save();
    await Ledger.create({
      product: item.product,
      type:    "OUTWARD",
      qty:     item.quantity,
      note:    `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`,
    });
  }
};

const restoreStock = async (items, orderId, note = "Order cancelled") => {
  for (const item of items) {
    const inv = await Inventory.findOne({ product: item.product });
    if (!inv) continue;
    inv.stock = inv.stock + item.quantity;
    await inv.save();
    await Ledger.create({
      product: item.product,
      type:    "INWARD",
      qty:     item.quantity,
      note:    `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`,
    });
  }
};

// ─── RESOLVE ITEMS ────────────────────────────────────────────────────────────
// MAIN FIX:
//   packagingText = ORDER QUANTITY ko product ke unitDefs se convert karo
//   Pehle galti thi: product.weight.value use ho raha tha (hamesha 1 pcs tha)
//   Ab sahi hai: qty (order quantity) use hoti hai
//
// Example:
//   Product: good day biscuit, unitDefs=[{Box,200},{Packet,12}]
//   Order qty: 250
//   pcsToPackaging(250, [{Box,200},{Packet,12}]) => "1 Box 4 Packet 2 pcs"
const resolveItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0)
    throw { status: 400, message: "Items array required aur empty nahi hona chahiye" };

  // Global unitDefs — sirf fallback ke liye ek baar fetch karo
  const globalUnitDefs = await fetchUnitDefs();

  const resolved = await Promise.all(
    rawItems.map(async (it, idx) => {
      if (!it.productId)
        throw { status: 400, message: `Item ${idx + 1}: productId missing hai` };

      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1)
        throw { status: 400, message: `Item ${idx + 1}: quantity valid nahi hai (min 1)` };

      let product, ownerType, vendorId = null, productModel;

      if (it.type === "admin") {
        // product      = await Price.findById(it.productId);
        product = await Price.findById(
  it.productId
).lean();
        ownerType    = "admin";
        productModel = "Price";
      } else if (it.type === "vendor") {
        // product      = await VendorProduct.findById(it.productId);
        product = await VendorProduct.findById(
  it.productId
).lean();
        ownerType    = "vendor";
        productModel = "VendorProduct";
        vendorId     = product?.vendor || null;
      } else {
        throw { status: 400, message: `Item ${idx + 1}: type invalid hai (admin ya vendor hona chahiye)` };
      }

      if (!product)
        throw { status: 404, message: `Product nahi mila: ${it.productId}` };

      if (product.status !== "active")
        throw { status: 400, message: `Product active nahi hai: ${product.name}` };

      // const unitPrice = product.salePrice || product.price;
      const unitPrice =
  Number(it.price) ||
  product.salePrice ||
  product.price;
      const weight    = product.weight || { value: 1, unit: "pcs" };

      // ── Product ke apne unitDefs check karo ──────────────────────────────
      // const productUnitDefs =
      //   Array.isArray(product.unitDefs) && product.unitDefs.length > 0
      //     ? product.unitDefs
      //     : null;
   


// let productUnitDefs =
//   Array.isArray(product.unitDefs) &&
//   product.unitDefs.length > 0
//     ? product.unitDefs.map((u) => ({
//         label: u.label,
//         multiplier: Number(
//           u.multiplier || 1
//         ),
//       }))
//     : [];

// if (
//   productUnitDefs.length === 0 &&
//   Array.isArray(product.unitConversions) &&
//   product.unitConversions.length > 0
// ) {
//   productUnitDefs =
//     product.unitConversions.map((u) => ({
//       label: u.unit,
//       multiplier: Number(
//         u.nPcs || 1
//       ),
//     }));
// }

// // // ✅ FALLBACK
// // if (productUnitDefs.length === 0) {
// //   productUnitDefs = globalUnitDefs;
// // }


// if (productUnitDefs.length === 0) {
//   productUnitDefs =
//     globalUnitDefs.map((u) => ({
//       label:
//         u.label || "pcs",

//       multiplier: Number(
//         u.multiplier || 1
//       ),
//     }));
// }


//      let packagingText = "";

// // ✅ PCS BASED PRODUCTS
// if (weight?.unit === "pcs") {
//   packagingText = pcsToPackaging(
//     qty,
//     productUnitDefs || []
//   );
// }

// // ✅ KG / GM / LTR PRODUCTS
// else {
//   packagingText = weightToText(weight);
// }

// return {
//   product: product._id,

//   name:
//     product.name,

//   image:
//     product.image || "",

//   unitPrice,

//   quantity: qty,

//   price:
//     +(unitPrice * qty).toFixed(2),

//   ownerType,

//   vendorId,

//   productModel,

//   mrp:
//     product.mrp ||
//     unitPrice,

//   hsn:
//     product.hsnCode ||
//     product.hsn ||
//     "",

//   gstRate:
//     product.gstPercent ??
//     product.gstRate ??
//     0,

//   cess:
//     product.cessPercent ??
//     product.cess ??
//     0,

//   unit:
//     product.unit ||
//     weight.unit ||
//     "pcs",

//   // ✅ FINAL PACKAGING
//   packing:
//     packagingText,

//   packagingText,

//   // ✅ SAVE UNIT CONVERSIONS
//   unitDefs:
//     productUnitDefs || [],
// };
// })
// );

// const totalPrice =
//   +resolved.reduce(
//     (sum, i) => sum + i.price,
//     0
//   ).toFixed(2);

// return {
//   resolved,
//   totalPrice,
// };
// };



let productUnitDefs = [];

// ✅ ADMIN PRODUCTS
if (
  Array.isArray(product.unitDefs) &&
  product.unitDefs.length > 0
) {
  productUnitDefs =
    product.unitDefs.map((u) => ({
      label:
        u.label ||
        u.unit ||
        "pcs",

      multiplier: Number(
        u.multiplier ||
        u.nPcs ||
        1
      ),
    }));
}

// ✅ VENDOR PRODUCTS
else if (
  Array.isArray(product.unitConversions) &&
  product.unitConversions.length > 0
) {
  productUnitDefs =
    product.unitConversions.map((u) => ({
      label:
        u.label ||
        u.unit ||
        "pcs",

      multiplier: Number(
        u.multiplier ||
        u.nPcs ||
        1
      ),
    }));
}

// ✅ FALLBACK GLOBAL UNITS
else {
  productUnitDefs =
    globalUnitDefs.map((u) => ({
      label:
        u.label || "pcs",

      multiplier: Number(
        u.multiplier || 1
      ),
    }));
}

let packagingText = "";

// ✅ PCS BASED PRODUCTS
if (
  String(weight?.unit)
    .toLowerCase()
    .trim() === "pcs"
) {
  packagingText = pcsToPackaging(
    qty,
    productUnitDefs || []
  );
}

// ✅ KG / GM / LTR PRODUCTS
else {
  packagingText = weightToText(weight);
}

return {
  product: product._id,

  name:
    product.name,

  image:
    product.image || "",

  unitPrice,

  quantity: qty,

  price:
    +(unitPrice * qty).toFixed(2),

  ownerType,

  vendorId,

  productModel,

  mrp:
    product.mrp ||
    unitPrice,

  hsn:
    product.hsnCode ||
    product.hsn ||
    "",

  gstRate:
    product.gstPercent ??
    product.gstRate ??
    0,

  cess:
    product.cessPercent ??
    product.cess ??
    0,

  unit:
    product.unit ||
    weight.unit ||
    "pcs",

  // ✅ FINAL PACKAGING
  packing:
    packagingText,

  packagingText,

  // ✅ SAVE UNIT CONVERSIONS
  unitDefs:
    productUnitDefs || [],
};
})
);

const totalPrice =
  +resolved.reduce(
    (sum, i) => sum + i.price,
    0
  ).toFixed(2);

return {
  resolved,
  totalPrice,
};
};
// ─── COUPON HELPER ────────────────────────────────────────────────────────────
const applyCouponIfProvided = async (couponCode, totalPrice) => {
  if (!couponCode || String(couponCode).trim() === "") return null;

  const code   = String(couponCode).trim().toUpperCase();
  const coupon = await Coupon.findOne({ couponCode: code, status: "active" });

  if (!coupon)
    throw { status: 404, message: `Coupon "${code}" valid nahi hai ya exist nahi karta` };

  if (new Date() > new Date(coupon.expiryDate))
    throw { status: 400, message: `Coupon "${code}" expire ho chuka hai` };

  if (totalPrice < (coupon.minOrderValue || 0))
    throw {
      status:  400,
      message: `Coupon apply karne ke liye minimum order ₹${coupon.minOrderValue} hona chahiye`,
    };

  let discount =
    coupon.discountType === "percentage"
      ? (totalPrice * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.discountType === "percentage" && coupon.maxDiscount)
    discount = Math.min(discount, coupon.maxDiscount);

  discount = +discount.toFixed(2);

  const finalPrice = +(totalPrice - discount).toFixed(2);

  return {
    couponCode:     coupon.couponCode,
    couponDiscount: discount,
    finalPrice,
  };
};

// ─── GST BREAKDOWN HELPER ─────────────────────────────────────────────────────
const buildGstSummary = (items) => {
  let totalTaxableValue = 0;
  let totalCgst         = 0;
  let totalSgst         = 0;
  let totalCess         = 0;
  let totalGst          = 0;

  const itemBreakdown = items.map((item) => {
    const gstRate  = item.gstRate || 0;
    const cessRate = item.cess    || 0;

    const divisor      = 1 + gstRate / 100 + cessRate / 100;
    const taxableValue = +(item.price / divisor).toFixed(2);
    const cessAmount   = +((taxableValue * cessRate) / 100).toFixed(2);
    const cgst         = +((taxableValue * (gstRate / 2)) / 100).toFixed(2);
    const sgst         = cgst;
    const gstAmount    = +((cgst + sgst + cessAmount)).toFixed(2);

    totalTaxableValue += taxableValue;
    totalCgst         += cgst;
    totalSgst         += sgst;
    totalCess         += cessAmount;
    totalGst          += gstAmount;

    return {
      name:         item.name,
      hsn:          item.hsn      || "",
      quantity:     item.quantity,
      unit:         item.unit     || "pcs",
      mrp:          item.mrp      || item.unitPrice,
      unitPrice:    item.unitPrice,
      gstRate:      `${gstRate}%`,
      cessRate:     `${cessRate}%`,
      taxableValue: +taxableValue.toFixed(2),
      cgst:         +cgst.toFixed(2),
      sgst:         +sgst.toFixed(2),
      cess:         +cessAmount.toFixed(2),
      totalGst:     +gstAmount.toFixed(2),
      lineTotal:    item.price,
    };
  });

  return {
    itemBreakdown,
    totals: {
      taxableValue: +totalTaxableValue.toFixed(2),
      cgst:         +totalCgst.toFixed(2),
      sgst:         +totalSgst.toFixed(2),
      cess:         +totalCess.toFixed(2),
      totalGst:     +totalGst.toFixed(2),
    },
  };
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, address, couponCode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const { resolved, totalPrice } = await resolveItems(items);

    const couponResult = await applyCouponIfProvided(couponCode, totalPrice);

    const orderData = {
      user:     user._id,
      userName: user.name || user.email,
      items:    resolved,

      originalItems:      resolved,
      originalTotalPrice: totalPrice,

      totalPrice,
      address,
      paidAmount:    0,
      paymentStatus: "unpaid",
    };

    if (couponResult) {
      orderData.couponCode     = couponResult.couponCode;
      orderData.couponDiscount = couponResult.couponDiscount;
      orderData.finalPrice     = couponResult.finalPrice;
    }

    const order = await Order.create(orderData);

    await deductStock(resolved, order._id);

    const gstSummary = buildGstSummary(resolved);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data:    order,
      summary: {
        totalPrice,
        couponApplied:  !!couponResult,
        couponCode:     couponResult?.couponCode     || null,
        couponDiscount: couponResult?.couponDiscount || 0,
        finalPrice:     couponResult?.finalPrice     ?? totalPrice,
        gst:            gstSummary,
      },
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ success: false, message: err.message });

    console.error("createOrder error:", err);
    return res.status(500).json({ success: false, message: "Order place karna fail ho gaya" });
  }
};

// ─── UPDATE ORDER STATUS ──────────────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const prevStatus = order.status;

    if (status === "cancelled" && prevStatus !== "cancelled")
      await restoreStock(order.items, order._id);

    if (prevStatus === "cancelled" && status !== "cancelled")
      await deductStock(order.items, order._id);

    order.status = status;
    await order.save();

    const updated = await Order.findById(order._id)
      .populate("user",          "name email")
      .populate("assignedRider", "name phone status vehicleType")
      .populate("items.product");

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ success: false, message: "Status update fail ho gaya" });
  }
};

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("assignedRider", "name phone status vehicleType")
      .populate("items.product");

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({ success: false, message: "Fetch fail" });
  }
};

// ─── GET ALL ORDERS ───────────────────────────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user",          "name email")
      .populate("assignedRider", "name phone status vehicleType")
      .populate("items.product");

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ success: false, message: "Fetch fail" });
  }
};

// ─── ASSIGN RIDER ─────────────────────────────────────────────────────────────
exports.assignRider = async (req, res) => {
  try {
    const { riderId } = req.body;

    if (riderId) {
      const rider = await Rider.findById(riderId);
      if (!rider)
        return res.status(404).json({ success: false, message: "Rider not found" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedRider: riderId || null },
      { new: true }
    ).populate("assignedRider", "name phone status vehicleType");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error("assignRider error:", err);
    return res.status(500).json({ success: false, message: "Assign fail ho gaya" });
  }
};

// ─── UPDATE ORDER ITEMS ───────────────────────────────────────────────────────
exports.updateOrderItems = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const oldItems                 = order.items;
    const { resolved, totalPrice } = await resolveItems(req.body.items);

    if (order.status !== "cancelled") {
      await restoreStock(oldItems, order._id, "Order items updated (old)");
      await deductStock(resolved,  order._id, "Order items updated (new)");
    }

    order.items      = resolved;
    order.totalPrice = totalPrice;

    if (order.couponCode) {
      const couponResult = await applyCouponIfProvided(order.couponCode, totalPrice);
      if (couponResult) {
        order.couponDiscount = couponResult.couponDiscount;
        order.finalPrice     = couponResult.finalPrice;
      } else {
        order.couponCode     = null;
        order.couponDiscount = 0;
        order.finalPrice     = null;
      }
    }

    if (order.paidAmount > (order.finalPrice ?? order.totalPrice))
      order.paidAmount = order.finalPrice ?? order.totalPrice;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user",          "name email")
      .populate("assignedRider", "name phone status vehicleType")
      .populate("items.product");

    const gstSummary = buildGstSummary(resolved);

    return res.json({
      success: true,
      message: "Order updated successfully",
      data:    updatedOrder,
      summary: {
        totalPrice,
        couponApplied:  !!order.couponCode,
        couponCode:     order.couponCode     || null,
        couponDiscount: order.couponDiscount || 0,
        finalPrice:     order.finalPrice     ?? totalPrice,
        gst:            gstSummary,
      },
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ success: false, message: err.message });

    console.error("updateOrderItems error:", err);
    return res.status(500).json({ success: false, message: "Order update fail ho gaya" });
  }
};

// ─── UPDATE PAYMENT ───────────────────────────────────────────────────────────
exports.updatePayment = async (req, res) => {
  try {
    const { paidAmount, paymentNote } = req.body;

    if (paidAmount === undefined || paidAmount === null)
      return res.status(400).json({ success: false, message: "paidAmount required hai" });

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const effectiveTotal = order.finalPrice ?? order.totalPrice;
    const safeAmount     = Math.min(Math.max(0, Number(paidAmount) || 0), effectiveTotal);

    order.paidAmount = safeAmount;
    if (paymentNote !== undefined) order.paymentNote = paymentNote;

    await order.save();

    return res.json({ success: true, message: "Payment updated successfully", data: order });
  } catch (err) {
    console.error("updatePayment error:", err);
    return res.status(500).json({ success: false, message: "Payment update fail ho gaya" });
  }
};