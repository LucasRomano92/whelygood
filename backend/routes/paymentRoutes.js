const express = require("express");
const Stripe = require("stripe");
const Bike = require("../models/Bike");
const Setting = require("../models/Setting");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const WHEELY_GOOD_LOCATION = {
  lat: -28.6567,
  lng: 153.6129,
};

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const getShopShipping = (distanceKm) => {
  if (distanceKm <= 20) {
    return {
      shippingPrice: 0,
      shippingLabel: "Byron Shire delivery — Assembled Bike Delivery",
      deliveryEstimate: "Same day if ordered before 10:00 AM",
    };
  }

  if (distanceKm <= 50) {
    return {
      shippingPrice: 120,
      shippingLabel: "Assembled Bike Delivery",
      deliveryEstimate: "1–2 business days",
    };
  }

  return {
    shippingPrice: 200,
    shippingLabel: "Box shipping",
    deliveryEstimate: "3–7 business days",
  };
};

const getRentalPrice = (bike, totalDays) => {
  if (totalDays === 1) return Number(bike.rentalPrices?.day1 || 0);
  if (totalDays === 2) return Number(bike.rentalPrices?.day2 || 0);
  if (totalDays === 3) return Number(bike.rentalPrices?.day3 || 0);
  if (totalDays === 4) return Number(bike.rentalPrices?.day4 || 0);
  if (totalDays === 5) return Number(bike.rentalPrices?.day5 || 0);
  if (totalDays === 6) return Number(bike.rentalPrices?.day6 || 0);
  if (totalDays === 7) return Number(bike.rentalPrices?.day7 || 0);
  if (totalDays === 30) return Number(bike.rentalPrices?.month || 0);

  return 0;
};

router.post("/calculate-shop-shipping", async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const customerLat = Number(lat);
    const customerLng = Number(lng);

    if (Number.isNaN(customerLat) || Number.isNaN(customerLng)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const distanceKm = getDistanceKm(
      WHEELY_GOOD_LOCATION.lat,
      WHEELY_GOOD_LOCATION.lng,
      customerLat,
      customerLng
    );

    const shipping = getShopShipping(distanceKm);

    res.status(200).json({
      distanceKm: Number(distanceKm.toFixed(1)),
      ...shipping,
    });
  } catch (error) {
    console.error("Calculate shop shipping error:", error);
    res.status(500).json({
      error: "Error calculating shipping",
      details: error.message,
    });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const {
      bikeId,
      deliveryMethod = "pickup",
      deliveryAddress = "",
      lat,
      lng,
    } = req.body;

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

    let shippingPrice = 0;
    let shippingLabel = "Local Pickup";
    let deliveryEstimate = "Pickup from Wheely Good";
    let distanceKm = 0;

    if (deliveryMethod === "delivery") {
      if (!deliveryAddress || lat === undefined || lng === undefined) {
        return res.status(400).json({
          error: "Delivery address and coordinates are required",
        });
      }

      const customerLat = Number(lat);
      const customerLng = Number(lng);

      if (Number.isNaN(customerLat) || Number.isNaN(customerLng)) {
        return res.status(400).json({ error: "Invalid delivery coordinates" });
      }

      distanceKm = getDistanceKm(
        WHEELY_GOOD_LOCATION.lat,
        WHEELY_GOOD_LOCATION.lng,
        customerLat,
        customerLng
      );

      const shipping = getShopShipping(distanceKm);

      shippingPrice = shipping.shippingPrice;
      shippingLabel = shipping.shippingLabel;
      deliveryEstimate = shipping.deliveryEstimate;
    }

    const lineItems = [
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
    ];

    if (shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: shippingLabel,
            description: deliveryEstimate,
          },
          unit_amount: Math.round(Number(shippingPrice) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,

      metadata: {
        type: "shop",
        bikeId: bike._id.toString(),
        bikeName: bike.name,
        deliveryMethod,
        deliveryAddress,
        distanceKm: String(Number(distanceKm.toFixed(1))),
        shippingPrice: String(shippingPrice),
        shippingLabel,
        deliveryEstimate,
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
      items,
      name,
      email,
      phone,
      startDate,
      endDate,
      pickupTime = "",
      surfboardRack = false,
      notes = "",
    } = req.body;

    if (!items?.length || !name || !email || !phone || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    if (start < today) {
      return res.status(400).json({ error: "Start date cannot be in the past" });
    }

    if (end < start) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (![1, 2, 3, 4, 5, 6, 7, 30].includes(totalDays)) {
      return res.status(400).json({ error: "Invalid rental duration" });
    }

    const rackPrices = {
      1: 15,
      2: 30,
      3: 45,
      4: 45,
      5: 45,
      6: 45,
      7: 45,
      30: 45,
    };

    const bookingItems = [];
    const lineItems = [];
    let amountTotal = 0;

    for (const item of items) {
      const bike = await Bike.findById(item.bikeId);
      const requestedQuantity = Number(item.quantity || 1);

      if (!bike) {
        return res.status(404).json({ error: "Bike not found" });
      }

      if (bike.category !== "rent") {
        return res.status(400).json({ error: `${bike.name} is not for rent` });
      }

      if (bike.isActive === false) {
        return res.status(400).json({ error: `${bike.name} is not available` });
      }

      if (!requestedQuantity || requestedQuantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      if (Number(bike.stock) < requestedQuantity) {
        return res.status(400).json({
          error: `Not enough stock available for ${bike.name}`,
        });
      }

      const rentalPrice = getRentalPrice(bike, totalDays);

      if (!rentalPrice || rentalPrice <= 0) {
        return res.status(400).json({
          error: `${bike.name} does not have a valid price for this duration`,
        });
      }

      const itemTotal = rentalPrice * requestedQuantity;
      amountTotal += itemTotal;

      bookingItems.push({
        bikeId: bike._id.toString(),
        bikeName: bike.name,
        quantity: requestedQuantity,
        rentalPrice,
        total: itemTotal,
      });

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: `${bike.name} rental`,
            description:
              totalDays === 30 ? "1 month rental" : `${totalDays} day rental`,
            images: bike.image ? [bike.image] : [],
          },
          unit_amount: Math.round(rentalPrice * 100),
        },
        quantity: requestedQuantity,
      });
    }

    const rackPrice = surfboardRack ? rackPrices[totalDays] || 0 : 0;

    if (rackPrice > 0) {
      amountTotal += rackPrice;

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: "Surfboard Rack Add-on",
            description:
              totalDays === 30
                ? "Surfboard rack for 1 month rental"
                : `Surfboard rack for ${totalDays} day rental`,
          },
          unit_amount: Math.round(rackPrice * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: lineItems,

      metadata: {
        type: "booking",
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        startDate,
        endDate,
        pickupTime,
        pickupLocation: "Unit 1/122 Bangalow Rd",
        totalDays: String(totalDays),
        surfboardRack: String(Boolean(surfboardRack)),
        rackPrice: String(rackPrice),
        amountTotal: String(amountTotal),
        notes,
        items: JSON.stringify(bookingItems),
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