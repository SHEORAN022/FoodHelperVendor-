const Brand = require("../models/brandModel");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");


// CREATE BRAND
exports.createBrand = async (req, res) => {

  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Brand image is required",
      });
    }

    const uploadedImage = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "brands",
      }
    );

    const brand = await Brand.create({
      name,
      image: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
    });

    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      data: brand,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


// GET ALL BRANDS
exports.getBrands = async (req, res) => {

  try {

    const brands = await Brand.find();

    return res.status(200).json({
      success: true,
      data: brands,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};