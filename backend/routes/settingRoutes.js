const express = require("express");
const router = express.Router();

const Setting = require("../models/Setting");

// GET shipping price
router.get("/shipping", async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: "shippingPrice" });

    if (!setting) {
      setting = await Setting.create({
        key: "shippingPrice",
        value: 150,
      });
    }

    res.json(setting);
  } catch (err) {
    console.error("❌ ERROR GET SHIPPING:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE shipping price
router.put("/shipping", async (req, res) => {
  try {
    const { value } = req.body;

 const updated = await Setting.findOneAndUpdate(
  { key: "shippingPrice" },
  { value },
  { returnDocument: "after", upsert: true }
);

    res.json(updated);
  } catch (err) {
    console.error("❌ ERROR UPDATE SHIPPING:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;