const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },

    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bike",
    },

    bikeName: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    amountTotal: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "aud",
    },

    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    status: {
      type: String,
      enum: ["paid", "pending", "shipped", "delivered", "cancelled"],
      default: "paid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);