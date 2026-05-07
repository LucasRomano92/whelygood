const express = require("express");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

const Order = require("../models/Order");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 📩 CONFIG EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

      const email = session.customer_details?.email || "No email";
      const name = session.customer_details?.name || "Customer";
      const total = session.amount_total / 100;
      const currency = session.currency?.toUpperCase() || "AUD";
      const address = session.customer_details?.address;

      console.log("🔥 PAYMENT SUCCESSFUL");

      // 💾 GUARDAR ORDER EN DB
      try {
        const existingOrder = await Order.findOne({
          stripeSessionId: session.id,
        });

        if (!existingOrder) {
          await Order.create({
            stripeSessionId: session.id,

            bikeId: session.metadata?.bikeId,
            bikeName: session.metadata?.bikeName || "Bike purchase",

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
        await transporter.sendMail({
          from: `"Wheely Good" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
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
        await transporter.sendMail({
          from: `"Wheely Good" <${process.env.EMAIL_USER}>`,
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