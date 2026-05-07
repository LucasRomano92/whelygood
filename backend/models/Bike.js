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