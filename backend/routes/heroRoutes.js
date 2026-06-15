const express = require("express");
const HeroSlide = require("../models/HeroSlide");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET active hero slides - public
router.get("/", async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });

    res.status(200).json(slides);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching hero slides",
      error: error.message,
    });
  }
});

// GET all hero slides - admin
router.get("/admin", authMiddleware, async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });

    res.status(200).json(slides);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching hero slides",
      error: error.message,
    });
  }
});

// CREATE hero slide
router.post("/", authMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);

    res.status(201).json({
      message: "Hero slide created",
      data: slide,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating hero slide",
      error: error.message,
    });
  }
});

// UPDATE hero slide
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!slide) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    res.status(200).json({
      message: "Hero slide updated",
      data: slide,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating hero slide",
      error: error.message,
    });
  }
});

// DELETE hero slide
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);

    if (!slide) {
      return res.status(404).json({
        message: "Hero slide not found",
      });
    }

    res.status(200).json({
      message: "Hero slide deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting hero slide",
      error: error.message,
    });
  }
});

module.exports = router;