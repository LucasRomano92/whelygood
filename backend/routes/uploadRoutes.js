require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const router = express.Router();

// 🔧 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🚀 Upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // convertir buffer → base64
    const base64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "wheelygood",
    });

    res.json({
      url: result.secure_url,
    });
  } catch (error) {
  console.error("CLOUDINARY ERROR:", error); // 👈 AGREGÁ ESTO

  res.status(500).json({
    message: "Upload failed",
    error: error.message,
  });
}
});

module.exports = router;