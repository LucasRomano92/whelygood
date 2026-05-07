const express = require("express");
const router = express.Router();
const axios = require("axios");
const Bike = require("../models/Bike");

// 🔐 Obtener access token
async function getAccessToken() {
  const response = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

// 🧾 Crear orden
router.post("/create-order", async (req, res) => {
  try {
    const { bikeId } = req.body;

    const bike = await Bike.findById(bikeId);

    if (!bike) {
      return res.status(404).json({ error: "Bike not found" });
    }

    const accessToken = await getAccessToken();

    const order = await axios.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "AUD",
              value: bike.price.toString(),
            },
            description: bike.name,
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/success`,
          cancel_url: `${process.env.FRONTEND_URL}/shop`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const approveUrl = order.data.links.find(
      (link) => link.rel === "approve"
    ).href;

    res.json({ url: approveUrl });
  } catch (error) {
    console.error("PayPal error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error creating PayPal order" });
  }
});

module.exports = router;