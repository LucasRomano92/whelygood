const express = require("express");
const Stripe = require("stripe");
const { Resend } = require("resend");

const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Bike = require("../models/Bike");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("📩 EVENT RECEIVED:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id
      );

      const metadata = session.metadata || {};
      const email = session.customer_details?.email || metadata.customerEmail;
      const name =
        session.customer_details?.name || metadata.customerName || "Customer";
      const total = session.amount_total / 100;
      const currency = session.currency?.toUpperCase() || "AUD";
      const address = session.customer_details?.address;

      console.log("🔥 PAYMENT SUCCESSFUL");

      // =========================
      // 🚲 BOOKING PAYMENT
      // =========================
      if (metadata.type === "booking") {
        try {
          const existingBooking = await Booking.findOne({
            stripeSessionId: session.id,
          });

          if (existingBooking) {
            console.log("⚠️ BOOKING ALREADY EXISTS");
            return res.json({ received: true });
          }

          let items = [];

          try {
            items = JSON.parse(metadata.items || "[]");
          } catch (err) {
            console.error("❌ ERROR PARSING BOOKING ITEMS:", err);
            return res.json({ received: true });
          }

          if (!items.length) {
            console.error("❌ NO BOOKING ITEMS FOUND");
            return res.json({ received: true });
          }

          for (const item of items) {
            const bike = await Bike.findById(item.bikeId);

            if (!bike) {
              console.error(`❌ BIKE NOT FOUND: ${item.bikeId}`);
              return res.json({ received: true });
            }

            if (Number(bike.stock) < Number(item.quantity)) {
              console.error(`❌ NOT ENOUGH STOCK FOR: ${bike.name}`);
              return res.json({ received: true });
            }
          }

          const booking = await Booking.create({
            stripeSessionId: session.id,
            paymentStatus: "paid",
            status: "confirmed",

            customerName: metadata.customerName || name,
            customerEmail: metadata.customerEmail || email,
            customerPhone: metadata.customerPhone || "",

            items,

            startDate: metadata.startDate,
            endDate: metadata.endDate,
           pickupTime: metadata.pickupTime || "",
pickupLocation:
  metadata.pickupLocation || "Unit 1/122 Bangalow Rd, Byron Bay NSW",

totalDays: Number(metadata.totalDays),

surfboardRack: metadata.surfboardRack === "true",
childSeat: metadata.childSeat === "true",
rearBasket: metadata.rearBasket === "true",

rackPrice: Number(metadata.rackPrice || 0),
childSeatPrice: Number(metadata.childSeatPrice || 0),
rearBasketPrice: Number(metadata.rearBasketPrice || 0),

amountTotal: total,
          });

          for (const item of items) {
            const bike = await Bike.findById(item.bikeId);

            bike.stock = Math.max(0, Number(bike.stock) - Number(item.quantity));
            await bike.save();
          }

          console.log("✅ BOOKING SAVED IN DB");
          console.log("✅ STOCK UPDATED");

          const itemsHtml = booking.items
            .map(
              (item) => `
                <li>
                  <strong>${item.bikeName}</strong><br/>
                  Quantity: ${item.quantity}<br/>
                  Rental price: $${item.rentalPrice}<br/>
                  Item total: $${item.total}
                </li>
              `
            )
            .join("");

          const accessoriesHtml = `
  <p><strong>Surfboard Rack:</strong> ${booking.surfboardRack ? `Yes - $${booking.rackPrice}` : "No"}</p>
  <p><strong>Child Seat:</strong> ${booking.childSeat ? `Yes - $${booking.childSeatPrice}` : "No"}</p>
  <p><strong>Rear Basket:</strong> ${booking.rearBasket ? `Yes - $${booking.rearBasketPrice}` : "No"}</p>
`;

          try {
            await resend.emails.send({
              from: "Wheely Good <bookings@wheelygoodrides.com.au>",
              to: process.env.OWNER_EMAIL,
              subject: "🚴 New paid booking - Wheely Good",
              html: `
                <h2>New Paid Booking</h2>

                <p><strong>Name:</strong> ${booking.customerName}</p>
                <p><strong>Email:</strong> ${booking.customerEmail}</p>
                <p><strong>Phone:</strong> ${booking.customerPhone}</p>

                <h3>Bikes</h3>
                <ul>${itemsHtml}</ul>

                ${accessoriesHtml}

                <p><strong>Dates:</strong> ${booking.startDate} → ${booking.endDate}</p>
                <p><strong>Pickup time:</strong> ${booking.pickupTime || "-"}</p>

                <h3>Pickup Information</h3>

                <p>
                  <strong>Pickup Address:</strong><br/>
                  Unit 1/122 Bangalow Rd<br/>
                  Byron Bay NSW 2481
                </p>

                <p>
                  <strong>Security Bond:</strong><br/>
                  $400 AUD refundable bond per bike to be collected at pickup.
                </p>

                <p><strong>Total days:</strong> ${booking.totalDays}</p>
                <p><strong>Total paid:</strong> $${booking.amountTotal} ${currency}</p>

                <p><strong>Notes:</strong> ${booking.notes || "-"}</p>
              `,
            });

            console.log("✅ OWNER BOOKING EMAIL SENT");
          } catch (err) {
            console.error("❌ OWNER BOOKING EMAIL ERROR:", err);
          }

          try {
            await resend.emails.send({
              from: "Wheely Good <bookings@wheelygoodrides.com.au>",
              to: booking.customerEmail,
              subject: "Your bike booking is confirmed 🚴",
              html: `
                <h2>Hi ${booking.customerName}!</h2>

                <p>Your bike booking has been confirmed and paid successfully.</p>

                <h3>Your bikes</h3>
                <ul>${itemsHtml}</ul>

                ${accessoriesHtml}

                <p><strong>Dates:</strong> ${booking.startDate} → ${booking.endDate}</p>
                <p><strong>Pickup time:</strong> ${booking.pickupTime || "-"}</p>
                <p><strong>Total days:</strong> ${booking.totalDays}</p>
                <p><strong>Total paid:</strong> $${booking.amountTotal} ${currency}</p>

                <h3>Pickup Information</h3>

                <p>
                  <strong>Pickup Address:</strong><br/>
                  Unit 1/122 Bangalow Rd<br/>
                  Byron Bay NSW 2481
                </p>

                <p>
                  Your bikes will be ready for collection at the selected pickup time.
                </p>

                <p>
                  A refundable <strong>$400 AUD security bond per bike</strong> will be collected upon pickup.
                </p>

                <p>
                  Please bring a valid photo ID when collecting your bikes.
                </p>

                <p>
                  The bond will be fully refunded when the bikes are returned in the same condition.
                </p>

                <br/>

                <p>Thank you for choosing Wheely Good 🚴</p>
              `,
            });

            console.log("✅ CUSTOMER BOOKING EMAIL SENT");
          } catch (err) {
            console.error("❌ CUSTOMER BOOKING EMAIL ERROR:", err);
          }
        } catch (err) {
          console.error("❌ BOOKING DB ERROR:", err);
        }

        return res.json({ received: true });
      }

      // =========================
      // 🛒 SHOP ORDER PAYMENT
      // =========================

      const deliveryMethod = metadata.deliveryMethod || "pickup";
      const deliveryAddress = metadata.deliveryAddress || "";
      const distanceKm = metadata.distanceKm || "";
      const shippingPrice = Number(metadata.shippingPrice || 0);
      const shippingLabel =
        metadata.shippingLabel ||
        (deliveryMethod === "pickup" ? "Local Pickup" : "Delivery");
      const deliveryEstimate =
        metadata.deliveryEstimate ||
        (deliveryMethod === "pickup"
          ? "Pickup from Wheely Good"
          : "Our team will contact you with delivery details");

      const stripeAddressHtml = address
        ? `
          ${address?.line1 || ""}<br/>
          ${address?.line2 || ""}<br/>
          ${address?.city || ""}<br/>
          ${address?.state || ""}<br/>
          ${address?.postal_code || ""}<br/>
          ${address?.country || ""}
        `
        : "-";

      const deliveryAddressHtml =
        deliveryMethod === "pickup"
          ? `
            <p>
              <strong>Pickup Address:</strong><br/>
              Unit 1/122 Bangalow Rd<br/>
              Byron Bay NSW 2481
            </p>
          `
          : `
            <p>
              <strong>Delivery Address:</strong><br/>
              ${deliveryAddress || stripeAddressHtml}
            </p>
          `;

      const deliveryInfoHtml = `
        <h3>Delivery Information</h3>

        <p><strong>Delivery Method:</strong> ${shippingLabel}</p>
        ${
          distanceKm
            ? `<p><strong>Distance from Wheely Good:</strong> ${distanceKm} km</p>`
            : ""
        }
        <p><strong>Shipping:</strong> $${shippingPrice} ${currency}</p>
        <p><strong>Estimated Delivery:</strong> ${deliveryEstimate}</p>

        ${deliveryAddressHtml}
      `;

      try {
        const existingOrder = await Order.findOne({
          stripeSessionId: session.id,
        });

        if (!existingOrder) {
          await Order.create({
            stripeSessionId: session.id,

            bikeId: metadata.bikeId,
            bikeName: metadata.bikeName || "Bike purchase",

            customerName: name,
            customerEmail: email,

            amountTotal: total,
            currency: session.currency || "aud",

            shippingAddress: {
              line1: address?.line1 || deliveryAddress || "",
              line2: address?.line2 || "",
              city: address?.city || "",
              state: address?.state || "",
              postalCode: address?.postal_code || "",
              country: address?.country || "AU",
            },

            deliveryMethod,
            deliveryAddress,
            distanceKm: Number(distanceKm || 0),
            shippingPrice,
            shippingLabel,
            deliveryEstimate,

            status: "paid",
          });

          console.log("✅ ORDER SAVED IN DB");
        } else {
          console.log("⚠️ ORDER ALREADY EXISTS");
        }
      } catch (err) {
        console.error("❌ ORDER DB ERROR:", err);
      }

      // 📧 EMAIL AL DUEÑO
      try {
        await resend.emails.send({
          from: "Wheely Good <orders@wheelygoodrides.com.au>",
          to: process.env.OWNER_EMAIL,
          subject: "🚴‍♂️ New order - Wheely Good",
          html: `
            <h2>New Order Received</h2>

            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>

            <h3>Bike</h3>
            <p><strong>${metadata.bikeName || "Bike purchase"}</strong></p>

            ${deliveryInfoHtml}

            <h3>Payment</h3>
            <p><strong>Total paid:</strong> $${total} ${currency}</p>
          `,
        });

        console.log("✅ OWNER EMAIL SENT");
      } catch (err) {
        console.error("❌ OWNER EMAIL ERROR:", err);
      }

      // 📧 EMAIL AL CLIENTE
      try {
        await resend.emails.send({
          from: "Wheely Good <orders@wheelygoodrides.com.au>",
          to: email,
          subject: "Your order is confirmed 🚴‍♂️",
          html: `
            <h2>Thank you for your purchase!</h2>

            <p>Hi ${name},</p>

            <p>Your payment was received successfully.</p>

            <h3>Your Order</h3>
            <p><strong>${metadata.bikeName || "Bike purchase"}</strong></p>

            ${deliveryInfoHtml}

            <h3>Payment</h3>
            <p><strong>Total paid:</strong> $${total} ${currency}</p>

            <p>Our team will contact you shortly with the next steps.</p>

            <br/>

            <p>Thank you,</p>
            <p><strong>Wheely Good Team</strong></p>
          `,
        });

        console.log("✅ CUSTOMER EMAIL SENT");
      } catch (err) {
        console.error("❌ CUSTOMER EMAIL ERROR:", err);
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;