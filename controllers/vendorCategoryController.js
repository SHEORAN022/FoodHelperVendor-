

const VendorCategory = require("../models/VendorCategory");
const cloudinary = require("../utils/cloudinary");

/* ================= Upload Helper ================= */
const uploadToCloudinary = (buffer, folder = "vendor_categories") =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

/* ================================================================
   LEVEL 1 — CATEGORY
   ================================================================ */

exports.createCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { name } = req.body;

    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Category name is required" });

    const exists = await VendorCategory.findOne({ vendor: vendorId, name: name.trim() });
    if (exists)
      return res.status(409).json({ success: false, message: "Category already exists" });

    let image = null;
    if (req.file) image = await uploadToCloudinary(req.file.buffer);

    const category = await VendorCategory.create({
      vendor: vendorId,
      name: name.trim(),
      image,
      status: "pending",
      active: false,
    });

    res.status(201).json({
      success: true,
      message: "Category created and sent for admin approval",
      category,
    });
  } catch (err) {
    console.error("Create Category Error:", err);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const categories = await VendorCategory.find({ vendor: vendorId }).sort({ createdAt: -1 });

    const result = categories.map((cat) => {
      const obj = cat.toObject();
      if (cat.status === "approved") {
        obj.subcategories = obj.subcategories.filter((s) => s.active);
        obj.subcategories = obj.subcategories.map((s) => ({
          ...s,
          subSubCategories: (s.subSubCategories || []).filter((ss) => ss.active),
        }));
      }
      return obj;
    });

    res.json({ success: true, categories: result });
  } catch (err) {
    console.error("Get Categories Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { id } = req.params;
    const { name } = req.body;

    const category = await VendorCategory.findOne({ _id: id, vendor: vendorId });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    if (name?.trim()) {
      category.name = name.trim();
      category.status = "pending";
      category.active = false;
    }
    if (req.file) {
      category.image = await uploadToCloudinary(req.file.buffer);
      category.status = "pending";
      category.active = false;
    }

    await category.save();
    res.json({ success: true, message: "Category updated and sent for re-approval", category });
  } catch (err) {
    console.error("Update Category Error:", err);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { id } = req.params;

    const deleted = await VendorCategory.findOneAndDelete({ _id: id, vendor: vendorId });
    if (!deleted)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete Category Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

/* ================================================================
   LEVEL 2 — SUBCATEGORY
   ================================================================ */

exports.addSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId } = req.params;
    const { name } = req.body;

    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Subcategory name is required" });

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved by admin" });

    const exists = category.subcategories.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists)
      return res.status(409).json({ success: false, message: "Subcategory already exists" });

    let image = null;
    if (req.file) image = await uploadToCloudinary(req.file.buffer, "vendor_subcategories");

    category.subcategories.push({ name: name.trim(), image, active: true });
    await category.save();

    res.status(201).json({ success: true, subcategory: category.subcategories.at(-1) });
  } catch (err) {
    console.error("Add SubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to add subcategory" });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId } = req.params;
    const { name, active } = req.body;

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    if (name?.trim()) sub.name = name.trim();
    if (typeof active !== "undefined") sub.active = active;
    if (req.file) sub.image = await uploadToCloudinary(req.file.buffer, "vendor_subcategories");

    await category.save();
    res.json({ success: true, subcategory: sub });
  } catch (err) {
    console.error("Update SubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to update subcategory" });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId } = req.params;

    const category = await VendorCategory.findOne({ _id: catId, vendor: vendorId });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    category.subcategories = category.subcategories.filter(
      (s) => s._id.toString() !== subId
    );
    await category.save();
    res.json({ success: true, message: "Subcategory deleted successfully" });
  } catch (err) {
    console.error("Delete SubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete subcategory" });
  }
};

/* ================================================================
   LEVEL 3 — SUB-SUBCATEGORY
   ================================================================ */

exports.addSubSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId } = req.params;
    const { name } = req.body;

    if (!name?.trim())
      return res.status(400).json({ success: false, message: "Sub-subcategory name is required" });

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved" });

    const sub = category.subcategories.id(subId);
    if (!sub || !sub.active)
      return res.status(404).json({ success: false, message: "Subcategory not found or inactive" });

    const exists = sub.subSubCategories.find(
      (ss) => ss.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists)
      return res.status(409).json({ success: false, message: "Sub-subcategory already exists" });

    let image = null;
    if (req.file) image = await uploadToCloudinary(req.file.buffer, "vendor_subsubcategories");

    sub.subSubCategories.push({ name: name.trim(), image, active: true });
    await category.save();

    res.status(201).json({ success: true, subSubCategory: sub.subSubCategories.at(-1) });
  } catch (err) {
    console.error("Add SubSubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to add sub-subcategory" });
  }
};

exports.updateSubSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId } = req.params;
    const { name, active } = req.body;

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const subsub = sub.subSubCategories.id(subsubId);
    if (!subsub)
      return res.status(404).json({ success: false, message: "Sub-subcategory not found" });

    if (name?.trim()) subsub.name = name.trim();
    if (typeof active !== "undefined") subsub.active = active;
    if (req.file) subsub.image = await uploadToCloudinary(req.file.buffer, "vendor_subsubcategories");

    await category.save();
    res.json({ success: true, subSubCategory: subsub });
  } catch (err) {
    console.error("Update SubSubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to update sub-subcategory" });
  }
};

exports.deleteSubSubCategory = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId } = req.params;

    const category = await VendorCategory.findOne({ _id: catId, vendor: vendorId });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    sub.subSubCategories = sub.subSubCategories.filter(
      (ss) => ss._id.toString() !== subsubId
    );
    await category.save();
    res.json({ success: true, message: "Sub-subcategory deleted successfully" });
  } catch (err) {
    console.error("Delete SubSubCategory Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete sub-subcategory" });
  }
};

/* ================================================================
   LEVEL 4 — PRODUCTS
   ================================================================ */

exports.addProduct = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId } = req.params;
    const { name, description, price, discountPrice, stock, unit } = req.body;

    if (!name?.trim() || !price)
      return res.status(400).json({ success: false, message: "Product name and price are required" });

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved" });

    const sub = category.subcategories.id(subId);
    if (!sub || !sub.active)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const subsub = sub.subSubCategories.id(subsubId);
    if (!subsub || !subsub.active)
      return res.status(404).json({ success: false, message: "Sub-subcategory not found" });

    let image = null;
    if (req.file) image = await uploadToCloudinary(req.file.buffer, "vendor_products");

    subsub.products.push({
      name: name.trim(),
      description: description || "",
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      image,
      stock: parseInt(stock) || 0,
      unit: unit || "piece",
      active: true,
    });
    await category.save();

    res.status(201).json({ success: true, product: subsub.products.at(-1) });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId, productId } = req.params;
    const { name, description, price, discountPrice, stock, unit, active } = req.body;

    const category = await VendorCategory.findOne({
      _id: catId, vendor: vendorId, status: "approved", active: true,
    });
    if (!category)
      return res.status(403).json({ success: false, message: "Category not approved" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const subsub = sub.subSubCategories.id(subsubId);
    if (!subsub)
      return res.status(404).json({ success: false, message: "Sub-subcategory not found" });

    const product = subsub.products.id(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (name?.trim()) product.name = name.trim();
    if (description !== undefined) product.description = description;
    if (price) product.price = parseFloat(price);
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (unit) product.unit = unit;
    if (typeof active !== "undefined") product.active = active;
    if (req.file) product.image = await uploadToCloudinary(req.file.buffer, "vendor_products");

    await category.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId, productId } = req.params;

    const category = await VendorCategory.findOne({ _id: catId, vendor: vendorId });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const subsub = sub.subSubCategories.id(subsubId);
    if (!subsub)
      return res.status(404).json({ success: false, message: "Sub-subcategory not found" });

    subsub.products = subsub.products.filter((p) => p._id.toString() !== productId);
    await category.save();

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const vendorId = req.vendor.id;
    const { catId, subId, subsubId } = req.params;

    const category = await VendorCategory.findOne({ _id: catId, vendor: vendorId });
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    const sub = category.subcategories.id(subId);
    if (!sub)
      return res.status(404).json({ success: false, message: "Subcategory not found" });

    const subsub = sub.subSubCategories.id(subsubId);
    if (!subsub)
      return res.status(404).json({ success: false, message: "Sub-subcategory not found" });

    res.json({ success: true, products: subsub.products });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};
