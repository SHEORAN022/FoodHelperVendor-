const Report = require("../models/reportModel");
const cloudinary = require("../utils/cloudinary");

/* ================= CREATE REPORT ================= */
exports.createReport = async (req, res) => {
  try {
    const { title, description, fileType } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    const uploadResult = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "reports",
        resource_type: "auto",
      }
    );

    const report = await Report.create({
      title,
      description,
      fileType,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET ALL ================= */
exports.getReports = async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json({ success: true, data: reports });
};

/* ================= DELETE ================= */
exports.deleteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  await cloudinary.uploader.destroy(report.filePublicId, {
    resource_type: "auto",
  });

  await report.deleteOne();
  res.json({ success: true });
};
