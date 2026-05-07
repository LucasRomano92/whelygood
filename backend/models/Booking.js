const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.replace(/\D/g, "").length >= 8;
        },
        message: "Invalid phone number",
      },
    },

    bike: {
      type: String,
      required: true,
    },

    bikeId: {
      type: String,
      required: true,
    },

    startDate: {
      type: String,
      required: true,
    },

    endDate: {
      type: String,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);