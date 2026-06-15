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

          const bike = await Bike.findById(metadata.bikeId);

          if (!bike) {
            console.error("❌ BIKE NOT FOUND FOR BOOKING");
            return res.json({ received: true });
          }

          const quantity = Number(metadata.quantity || 1);

          if (bike.stock < quantity) {
            console.error("❌ NOT ENOUGH STOCK AFTER PAYMENT");
            return res.json({ received: true });
          }

          const booking = await Booking.create({
            stripeSessionId: session.id,
            paymentStatus: "paid",
            status: "confirmed",

            customerName: metadata.customerName || name,
            customerEmail: metadata.customerEmail || email,
            customerPhone: metadata.customerPhone || "",

            bikeId: bike._id,
            bikeName: metadata.bikeName || bike.name,

            startDate: metadata.startDate,
            endDate: metadata.endDate,
            totalDays: Number(metadata.totalDays),

            quantity,
            pricePerDay: Number(metadata.pricePerDay),
            amountTotal: total,
            currency: session.currency || "aud",

            notes: metadata.notes || "",
          });

          bike.stock = Math.max(0, bike.stock - quantity);
          await bike.save();

          console.log("✅ BOOKING SAVED IN DB");
          console.log("✅ STOCK UPDATED");

          // 📧 EMAIL AL DUEÑO
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

                <p><strong>Bike:</strong> ${booking.bikeName}</p>
                <p><strong>Quantity:</strong> ${booking.quantity}</p>

                <p><strong>Dates:</strong> ${booking.startDate} → ${booking.endDate}</p>
                <p><strong>Total days:</strong> ${booking.totalDays}</p>
                <p><strong>Total paid:</strong> $${booking.amountTotal} ${currency}</p>

                <p><strong>Notes:</strong> ${booking.notes || "-"}</p>
              `,
            });

            console.log("✅ OWNER BOOKING EMAIL SENT");
          } catch (err) {
            console.error("❌ OWNER BOOKING EMAIL ERROR:", err);
          }

          // 📧 EMAIL AL CLIENTE
          try {
            await resend.emails.send({
              from: "Wheely Good <bookings@wheelygoodrides.com.au>",
              to: booking.customerEmail,
              subject: "Your bike booking is confirmed 🚴",
              html: `
                <h2>Hi ${booking.customerName}!</h2>

                <p>Your bike booking has been confirmed and paid successfully.</p>

                <p><strong>Bike:</strong> ${booking.bikeName}</p>
                <p><strong>Quantity:</strong> ${booking.quantity}</p>
                <p><strong>Dates:</strong> ${booking.startDate} → ${booking.endDate}</p>
                <p><strong>Total days:</strong> ${booking.totalDays}</p>
                <p><strong>Total paid:</strong> $${booking.amountTotal} ${currency}</p>

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
              line1: address?.line1 || "",
              line2: address?.line2 || "",
              city: address?.city || "",
              state: address?.state || "",
              postalCode: address?.postal_code || "",
              country: address?.country || "",
            },

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

            <p><strong>Total:</strong> $${total} ${currency}</p>

            <h3>Shipping Address</h3>

            <p>
              ${address?.line1 || ""}<br/>
              ${address?.city || ""}<br/>
              ${address?.state || ""}<br/>
              ${address?.postal_code || ""}<br/>
              ${address?.country || ""}
            </p>
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