require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const adminRoutes = require("./routes/adminRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const Booking = require("./models/Booking");
const Bike = require("./models/Bike");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const stripeWebhookRoutes = require("./routes/stripeWebhookRoutes");

const app = express();

app.use("/", stripeWebhookRoutes);

// 🧠 Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔌 Routes

app.use("/admin", adminRoutes);
app.use("/upload", uploadRoutes);
app.use("/payment", paymentRoutes);
app.use("/payment/paypal", paypalRoutes);
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/settings", require("./routes/settingRoutes"));

// 📧 MAIL CONFIGv
const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🏠 Test endpoint
app.get("/", (req, res) => {
  res.send("Backend WheelyGood running 🚴");
});
app.get("/test-email", async (req, res) => {
  try {
    await mailTransporter.sendMail({
      from: `"WheelyGood Test" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: "Test email from WheelyGood",
      html: "<h2>Email system is working ✅</h2>",
    });

    res.json({ message: "Test email sent ✅" });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);
    res.status(500).json({
      message: "Email test failed",
      error: error.message,
    });
  }
});

// 📝 POST booking
app.post("/booking", async (req, res) => {
  try {
    const { name, email, phone, bikeId, startDate, endDate, notes } = req.body;

    // ✅ Required fields
    if (!name || !email || !phone || !bikeId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // ✅ Phone validation
    if (phone.replace(/\D/g, "").length < 8) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // ✅ Check bike exists and is active
    const bike = await Bike.findById(bikeId);

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    if (!bike.isActive) {
      return res.status(400).json({
        message: "This bike is not available",
      });
    }

    // ✅ Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    if (start < today) {
      return res.status(400).json({
        message: "Start date cannot be in the past",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // ✅ Calculate days and price
    const diffTime = end.getTime() - start.getTime();
    const totalDays =
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays < 1) {
      return res.status(400).json({
        message: "Invalid rental duration",
      });
    }

    if (totalDays > 30) {
      return res.status(400).json({
        message: "Maximum rental duration is 30 days",
      });
    }

    const totalPrice = totalDays * bike.price;

    // ✅ Save booking
    const booking = await Booking.create({
      name,
      email,
      phone,
      bike: bike.name,
      bikeId: bike._id.toString(),
      startDate,
      endDate,
      totalDays,
      totalPrice,
      notes: notes || "",
    });

    // =========================
    // 📧 EMAIL AL CLIENTE
    // =========================
    await mailTransporter.sendMail({
      from: `"WheelyGood" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your booking request has been received 🚴",
      html: `
        <h2>Hi ${name}!</h2>
        <p>Your request for <strong>${bike.name}</strong> has been received.</p>
        <p>We will confirm availability and get back to you shortly.</p>
        <br/>
        <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
        <p><strong>Total days:</strong> ${totalDays}</p>
        <br/>
        <p>Thanks for choosing WheelyGood 🚴</p>
      `,
    });

    // =========================
    // 📧 EMAIL AL DUEÑO
    // =========================
    await mailTransporter.sendMail({
      from: `"WheelyGood" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: "New booking request 🚨",
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Bike:</strong> ${bike.name}</p>
        <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
        <p><strong>Total days:</strong> ${totalDays}</p>
        <p><strong>Total price:</strong> $${totalPrice}</p>
        <p><strong>Notes:</strong> ${notes || "-"}</p>
      `,
    });

    res.status(201).json({
      message: "Request saved and emails sent",
      data: booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error saving request",
      error: error.message,
    });
  }
});

// 📋 GET bookings (protegido)
app.get("/booking", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message,
    });
  }
});

// 🚲 CREATE bike
app.post("/bikes", authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.create(req.body);

    res.status(201).json({
      message: "Bike created successfully",
      data: bike,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating bike",
      error: error.message,
    });
  }
});

// 📋 GET all bikes
app.get("/bikes", async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    res.status(200).json(bikes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bikes",
      error: error.message,
    });
  }
});

// 📋 GET single bike
app.get("/bikes/:id", async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({
        message: "Bike not found",
      });
    }

    res.status(200).json(bike);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bike",
      error: error.message,
    });
  }
});

// ✏️ UPDATE bike
app.put("/bikes/:id", authMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Bike updated",
      data: bike,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating bike",
      error: error.message,
    });
  }
});

// ❌ DELETE bike
app.delete("/bikes/:id", authMiddleware, async (req, res) => {
  try {
    await Bike.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Bike deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting bike",
      error: error.message,
    });
  }
});

// 🔌 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    app.listen(process.env.PORT || 4000, () => {
      console.log(
        `Server running on http://localhost:${process.env.PORT || 4000}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });