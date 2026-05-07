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

module.exports = router;