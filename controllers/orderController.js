
const Order         = require("../models/Order");
const Price         = require("../models/priceModel");
const VendorProduct = require("../models/vendorProduct");
const User          = require("../models/User");
const Rider         = require("../models/Rider");
const Inventory     = require("../models/Inventory");
const Ledger        = require("../models/inventoryledger");
const Coupon        = require("../models/couponModel");
const UnitDef       = require("../models/unitDefModel");
const Vendor        = require("../models/Vendor"); 
const ServiceArea = require("../models/ServiceArea");
const VendorInventory = require(
  "../models/VendorInventory"
);


const sseClients = new Map();

// Helper: sabhi connected admins ko event bhejo
const broadcastNewOrder = (order) => {
  if (sseClients.size === 0) return;
  const payload = JSON.stringify({ type: "NEW_ORDER", order });
  for (const [clientId, res] of sseClients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // Client disconnect ho gaya — clean up
      sseClients.delete(clientId);
    }
  }
};


// ─── GLOBAL UNIT DEFS FETCH (sirf fallback ke liye) ──────────────────────────
async function fetchUnitDefs() {
  const defs = await UnitDef.find().lean();
  return defs?.length ? defs : [{ key: "pcs", label: "Pcs", multiplier: 1 }];
}


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



const deductStock = async (
  items,
  orderId,
  note = "Order placed"
) => {

  for (const item of items) {
if (
  item.ownerType === "vendor" &&
  item.vendorId
) {

  const vendorInv =
    await VendorInventory.findOne({
      vendor: item.vendorId,
      product: item.product,
    });

  // ❌ Inventory not found
  if (!vendorInv) continue;

  // ❌ Out of stock
  if (
    vendorInv.availableStock <
    item.quantity
  ) {
    throw {
      status: 400,
      message:
        `${item.name} out of stock`,
    };
  }

  let qtyToDeduct =
    Number(item.quantity);

  // ==========================================
  // ✅ VENDOR BATCH MODE
  // ==========================================
  if (
    Array.isArray(vendorInv.batches) &&
    vendorInv.batches.length > 0
  ) {

    for (
      let i = 0;
      i < vendorInv.batches.length;
      i++
    ) {

      const batch =
        vendorInv.batches[i];

      // ✅ already deducted
      if (qtyToDeduct <= 0)
        break;

      let batchQty =
        Number(batch.qty || 0);

      // ✅ skip empty batch
      if (batchQty <= 0)
        continue;

      // ======================================
      // ✅ FULL STOCK AVAILABLE
      // ======================================
      if (
        batchQty >= qtyToDeduct
      ) {

        batch.qty =
          batchQty -
          qtyToDeduct;

        qtyToDeduct = 0;
      }

      // ======================================
      // ✅ PARTIAL STOCK
      // ======================================
      else {

        batch.qty = 0;

        qtyToDeduct -= batchQty;
      }
    }

    // ✅ Remove empty batches
    vendorInv.batches =
      vendorInv.batches.filter(
        (b) => Number(b.qty) > 0
      );

    // ✅ IMPORTANT
    vendorInv.markModified(
      "batches"
    );

    // ✅ Recalculate stock
    const updatedStock =
      vendorInv.batches.reduce(
        (sum, b) =>
          sum + Number(b.qty || 0),
        0
      );

    vendorInv.availableStock =
      updatedStock;

    vendorInv.totalStock =
      updatedStock;
  }

  // ==========================================
  // ✅ NORMAL STOCK MODE
  // ==========================================
  else {

    vendorInv.availableStock =
      Math.max(
        0,
        vendorInv.availableStock -
          item.quantity
      );

    vendorInv.totalStock =
      Math.max(
        0,
        vendorInv.totalStock -
          item.quantity
      );
  }

  // ✅ AUTO OUT OF STOCK
  vendorInv.outOfStock =
    vendorInv.availableStock <= 0;

  // ✅ SAVE
  await vendorInv.save();

  console.log(
    "UPDATED VENDOR STOCK:",
    vendorInv.availableStock
  );

  console.log(
    "UPDATED VENDOR BATCHES:",
    vendorInv.batches
  );
}

    // ==================================================
    // ✅ ADMIN PRODUCT
    // ==================================================
    else {

      const inv =
        await Inventory.findOne({
          product: item.product,
        });

      // ❌ Inventory not found
      if (!inv) continue;

      // ❌ Out of stock
      if (
        inv.stock <
        item.quantity
      ) {
        throw {
          status: 400,
          message:
            `${item.name} out of stock`,
        };
      }

      let qtyToDeduct =
        Number(item.quantity);

      // ==========================================
      // ✅ BATCH MODE
      // ==========================================
      if (
        inv.batches &&
        inv.batches.length > 0
      ) {

        for (const batch of inv.batches) {

          if (qtyToDeduct <= 0)
            break;

          const availableQty =
            Number(batch.qty || 0);

          if (availableQty <= 0)
            continue;

          // enough stock
          if (
            availableQty >=
            qtyToDeduct
          ) {

            batch.qty =
              availableQty -
              qtyToDeduct;

            qtyToDeduct = 0;
          }

          // partial stock
          else {

            batch.qty = 0;

            qtyToDeduct -=
              availableQty;
          }
        }

        // ✅ Remove empty batches
        inv.batches =
          inv.batches.filter(
            (b) => b.qty > 0
          );
      }

      // ==========================================
      // ✅ NORMAL MODE
      // ==========================================
      else {

        inv.stock = Math.max(
          0,
          inv.stock -
            item.quantity
        );
      }

      await inv.save();
    }

    // ==================================================
    // ✅ LEDGER ENTRY
    // ==================================================
    await Ledger.create({
      product: item.product,
      type: "OUTWARD",
      qty: item.quantity,
      note:
        `${note} — Order #${String(orderId)
          .slice(-6)
          .toUpperCase()}`,
    });
  }
};

// const restoreStock = async (items, orderId, note = "Order cancelled") => {

//   for (const item of items) {
//     const inv = await Inventory.findOne({ product: item.product });
//     if (!inv) continue;
//     inv.stock = inv.stock + item.quantity;
//     await inv.save();
//     await Ledger.create({
//       product: item.product,
//       type:    "INWARD",
//       qty:     item.quantity,
//       note:    `${note} — Order #${String(orderId).slice(-6).toUpperCase()}`,
//     });
//   }
// };

const restoreStock = async (
  items,
  orderId,
  note = "Order cancelled"
) => {

  for (const item of items) {

    // ✅ VENDOR PRODUCT
    if (
      item.ownerType === "vendor" &&
      item.vendorId
    ) {

      const vendorInv =
        await VendorInventory.findOne({
          vendor: item.vendorId,
          product: item.product,
        });

      if (vendorInv) {

        // ✅ Restore stock
        vendorInv.availableStock +=
          item.quantity;

        vendorInv.totalStock +=
          item.quantity;

        // ✅ Back in stock
        vendorInv.outOfStock = false;

        await vendorInv.save();
      }
    }

    // ✅ ADMIN PRODUCT
    else {

      const inv =
        await Inventory.findOne({
          product: item.product,
        });

      if (inv) {

        // ✅ Restore stock
        inv.stock += item.quantity;

        await inv.save();
      }
    }

    // ✅ Ledger Entry
    await Ledger.create({
      product: item.product,
      type: "INWARD",
      qty: item.quantity,
      note:
        `${note} — Order #${String(orderId)
          .slice(-6)
          .toUpperCase()}`,
    });
  }
};

// ─── RESOLVE ITEMS ────────────────────────────────────────────────────────────
const resolveItems = async (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0)
    throw { status: 400, message: "Items array required aur empty nahi hona chahiye" };

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
        product = await Price.findById(it.productId).lean();
        ownerType    = "admin";
        productModel = "Price";
      } else if (it.type === "vendor") {
        product = await VendorProduct.findById(it.productId).lean();
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

      const unitPrice =
        Number(it.price) ||
        product.salePrice ||
        product.price;

      const weight = product.weight || { value: 1, unit: "pcs" };

      let productUnitDefs = [];

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
      } else if (
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
      } else {
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

      if (
        String(weight?.unit)
          .toLowerCase()
          .trim() === "pcs"
      ) {
        packagingText = pcsToPackaging(
          qty,
          productUnitDefs || []
        );
      } else {
        packagingText = weightToText(weight);
      }

      return {
        product: product._id,
        name:    product.name,
        image:   product.image || "",
        unitPrice,
        quantity: qty,
        price:    +(unitPrice * qty).toFixed(2),
        ownerType,
        vendorId,
        productModel,
        mrp:      product.mrp || unitPrice,
        hsn:      product.hsnCode || product.hsn || "",
        gstRate:  product.gstPercent ?? product.gstRate ?? 0,
        cess:     product.cessPercent ?? product.cess ?? 0,
        unit:     product.unit || weight.unit || "pcs",
        packing:  packagingText,
        packagingText,
        unitDefs: productUnitDefs || [],
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
    // const { items, address, couponCode } = req.body;
//    const {
//   items,
//   address,
//   couponCode,
//   city,
//   areaName,
//   pincode,
// } = req.body;

const {
  items,
  address,
  couponCode,

  // ✅ FRONTEND OPTIONAL
  deliveryCharge:
    frontendDeliveryCharge,

  handlingCharge:
    frontendHandlingCharge,

  // ✅ SERVICE AREA LOOKUP
  city,
  areaName,
  pincode,
} = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const { resolved, totalPrice } = await resolveItems(items);

    const couponResult = await applyCouponIfProvided(couponCode, totalPrice);
//     let deliveryCharge = 0;
// let handlingCharge = 0;

let deliveryCharge =
  Number(
    frontendDeliveryCharge || 0
  );

let handlingCharge =
  Number(
    frontendHandlingCharge || 0
  );

// ✅ AGAR FRONTEND SE NAHI AAYA
if (
  deliveryCharge <= 0 &&
  handlingCharge <= 0
) {
  const cityData =
    await ServiceArea.findOne({
      city: {
        $regex: new RegExp(
          `^${city}$`,
          "i"
        ),
      },

      active: true,
    });

  if (cityData) {
    const area =
      cityData.areas.find(
        (a) =>
          a.active &&
          a.name
            .toLowerCase()
            .trim() ===
            areaName
              ?.toLowerCase()
              .trim() &&
          String(a.pincode) ===
            String(pincode)
      );

    if (area) {
      deliveryCharge =
        Number(
          area.deliveryCharge || 0
        );

      handlingCharge =
        Number(
          area.handlingCharge || 0
        );
    }
  }
}

const cityData =
  await ServiceArea.findOne({
    city: {
      $regex: new RegExp(
        `^${city}$`,
        "i"
      ),
    },

    active: true,
  });

if (cityData) {
  const area = cityData.areas.find(
    (a) =>
      a.active &&
      a.name.toLowerCase() ===
        areaName.toLowerCase() &&
      a.pincode === pincode
  );

  if (area) {
    deliveryCharge =
      area.deliveryCharge || 0;

    handlingCharge =
      area.handlingCharge || 0;
  }
}
    const orderData = {
      user:     user._id,
      userName: user.name || user.email,
      items:    resolved,

      originalItems:      resolved,
      originalTotalPrice: totalPrice,

      totalPrice,
      deliveryCharge,
handlingCharge,
      address,
      paidAmount:    0,
      paymentStatus: "unpaid",
    };

    if (couponResult) {
      orderData.couponCode     = couponResult.couponCode;
      orderData.couponDiscount = couponResult.couponDiscount;
      // orderData.finalPrice     = couponResult.finalPrice;
      orderData.finalPrice =
  couponResult.finalPrice +
  deliveryCharge +
  handlingCharge;
    }


    if (!couponResult) {
  orderData.finalPrice =
    totalPrice +
    deliveryCharge +
    handlingCharge;
}
    const order = await Order.create(orderData);

    await deductStock(resolved, order._id);

    // ✅ SSE BROADCAST — naya order aate hi saare connected admins ko instantly bhejo
    // Populate karke bhejo taaki frontend ko proper data mile
    const populatedOrder = await Order.findById(order._id)
      .populate("user",            "name email")
      .populate("items.vendorId",  "name phone businessName gstin") // ← VENDOR POPULATE ADD KIYA
      .lean();

    broadcastNewOrder(populatedOrder);

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
        // finalPrice:     couponResult?.finalPrice     ?? totalPrice,
        finalPrice:
  orderData.finalPrice,
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

// ─── SSE ENDPOINT ─────────────────────────────────────────────────────────────
// Admin connect karta hai — connection open rehti hai, server push karta hai
exports.orderSSE = (req, res) => {
  // SSE headers set karo
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx buffering disable

  // Immediately flush headers
  res.flushHeaders();

  // Unique client ID
  const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Client register karo
  sseClients.set(clientId, res);
  console.log(`[SSE] Admin connected: ${clientId} | Total clients: ${sseClients.size}`);

  // Connected ka confirmation bhejo
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", clientId })}\n\n`);

  // Heartbeat — connection alive rakhne ke liye har 25s pe ping
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
    }
  }, 25_000);

  // Client disconnect hone pe cleanup
  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
    console.log(`[SSE] Admin disconnected: ${clientId} | Total clients: ${sseClients.size}`);
  });
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
      .populate("user",           "name email")
      .populate("assignedRider",  "name phone status vehicleType")
      .populate("items.product")
      .populate("items.vendorId", "name phone businessName gstin"); // ← VENDOR POPULATE ADD KIYA

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
      .populate("assignedRider",  "name phone status vehicleType")
      .populate("items.product")
      .populate("items.vendorId", "name phone businessName gstin"); // ← VENDOR POPULATE ADD KIYA

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
      .populate("user",           "name email")
      .populate("assignedRider",  "name phone status vehicleType")
      .populate("items.product")
      .populate("items.vendorId", "name phone businessName gstin"); // ← VENDOR POPULATE ADD KIYA

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
      .populate("user",           "name email")
      .populate("assignedRider",  "name phone status vehicleType")
      .populate("items.product")
      .populate("items.vendorId", "name phone businessName gstin"); // ← VENDOR POPULATE ADD KIYA

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