const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");

/* ================= CLOUDINARY ================= */
const uploadToCloudinary = (buffer, folder = "user_profiles") =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ success: true, user });
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (email) user.email = email;

    if (req.file) {
      user.profileImage = await uploadToCloudinary(req.file.buffer);
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
