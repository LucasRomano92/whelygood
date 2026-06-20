const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    rentalPrices: {
      day1: { type: Number, default: 80 },
      day2: { type: Number, default: 140 },
      day3: { type: Number, default: 180 },
      day4: { type: Number, default: 220 },
      day5: { type: Number, default: 260 },
      day6: { type: Number, default: 300 },
      day7: { type: Number, default: 330 },
      month: { type: Number, default: 1200 },
    },

    stock: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    galleryImages: [
      {
        type: String,
      },
    ],

    videoUrl: {
      type: String,
      default: "",
    },

    features: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      enum: ["rent", "shop"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bike", bikeSchema);