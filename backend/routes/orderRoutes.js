const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authMiddleware");

// 📩 CONFIG EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 👉 GET ALL ORDERS (🔐 PROTEGIDO)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ ERROR GET ORDERS:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 👉 UPDATE ORDER STATUS + EMAIL SHIPPED (🔐 PROTEGIDO)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "paid",
      "pending",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // 🚀 SOLO SI ES SHIPPED → ENVÍA EMAIL
    if (status === "shipped") {
      try {
        await transporter.sendMail({
          from: `"Wheely Good" <${process.env.EMAIL_USER}>`,
          to: order.customerEmail,
          subject: "Your order is on the way 🚴‍♂️",
          html: `
            <h2>Your order is on the way 🚴‍♂️</h2>

            <p>Hi ${order.customerName || "there"},</p>

            <p>Good news! Your order has been shipped.</p>

            <p><strong>Bike:</strong> ${order.bikeName}</p>
            <p><strong>Total:</strong> $${order.amountTotal} AUD</p>

            <br/>

            <p>Thanks for shopping with Wheely Good.</p>
            <p>We’ll see you on the road!</p>
          `,
        });

        console.log("📧 SHIPPED EMAIL SENT");
      } catch (err) {
        console.error("❌ SHIPPED EMAIL ERROR:", err);
      }
    }

    res.json(order);
  } catch (err) {
    console.error("❌ ERROR UPDATE ORDER STATUS:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;