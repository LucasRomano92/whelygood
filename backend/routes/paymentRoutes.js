const express = require("express");
const Stripe = require("stripe");
const Bike = require("../models/Bike");
const Setting = require("../models/Setting");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { bikeId } = req.body;

    if (!bikeId) {
      return res.status(400).json({ error: "bikeId is required" });
    }

    const bike = await Bike.findById(bikeId);

    if (!bike) {
      return res.status(404).json({ error: "Bike not found" });
    }

    if (bike.category !== "shop") {
      return res.status(400).json({ error: "This bike is not for sale" });
    }

    // 🔥 SHIPPING DINÁMICO DESDE DB
    const setting = await Setting.findOne({ key: "shippingPrice" });
    const shippingPrice = setting ? setting.value : 150;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: bike.name,
              description: bike.model || bike.description,
              images: bike.image ? [bike.image] : [],
            },
            unit_amount: Math.round(Number(bike.price) * 100),
          },
          quantity: 1,
        },
      ],

      // 📦 SHIPPING
      shipping_address_collection: {
        allowed_countries: ["AU"],
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingPrice * 100, // 🔥 DINÁMICO
              currency: "aud",
            },
            display_name: "Standard shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 3,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],

      // 🔥 METADATA (clave para orders)
      metadata: {
        bikeId: bike._id.toString(),
        bikeName: bike.name,
      },

      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/shop`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      error: "Error creating checkout session",
      details: error.message,
    });
  }
});

router.post("/create-booking-checkout", async (req, res) => {
  try {
    const {
      bikeId,
      name,
      email,
      phone,
      startDate,
      endDate,
      quantity = 1,
      notes = "",
    } = req.body;

    if (!bikeId || !name || !email || !phone || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required booking fields",
      });
    }

    const bike = await Bike.findById(bikeId);

    if (!bike) {
      return res.status(404).json({ error: "Bike not found" });
    }

    if (bike.category !== "rent") {
      return res.status(400).json({ error: "This bike is not for rent" });
    }

    if (!bike.isActive) {
      return res.status(400).json({ error: "This bike is not available" });
    }

    const requestedQuantity = Number(quantity);

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    if (bike.stock < requestedQuantity) {
      return res.status(400).json({
        error: "Not enough stock available",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    if (start < today) {
      return res.status(400).json({
        error: "Start date cannot be in the past",
      });
    }

    if (end < start) {
      return res.status(400).json({
        error: "End date must be after start date",
      });
    }

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays < 1 || totalDays > 30) {
      return res.status(400).json({
        error: "Rental duration must be between 1 and 30 days",
      });
    }

    const pricePerDay = Number(bike.price);
    const amountTotal = totalDays * pricePerDay * requestedQuantity;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      customer_email: email,

      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `${bike.name} rental`,
              description: `${totalDays} day rental`,
              images: bike.image ? [bike.image] : [],
            },
            unit_amount: Math.round(pricePerDay * totalDays * 100),
          },
          quantity: requestedQuantity,
        },
      ],

      metadata: {
        type: "booking",
        bikeId: bike._id.toString(),
        bikeName: bike.name,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        startDate,
        endDate,
        totalDays: String(totalDays),
        quantity: String(requestedQuantity),
        pricePerDay: String(pricePerDay),
        amountTotal: String(amountTotal),
        notes,
      },

      success_url: `${process.env.FRONTEND_URL}/success?type=booking`,
      cancel_url: `${process.env.FRONTEND_URL}/booking`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe booking checkout error:", error);
    res.status(500).json({
      error: "Error creating booking checkout session",
      details: error.message,
    });
  }
});

module.exports = router;