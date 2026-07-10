// ============================================
// HOMEBOSS - NODE.JS SERVER (Enhanced Analytics)
// ============================================

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const PrototypeRegistration = require("./models/PrototypeRegistration");

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------
// MongoDB Connection
// ----------------------
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection failed:", err));

// ----------------------
// Visitor Schema
// ----------------------
const visitorSchema = new mongoose.Schema({
    ip: String,
    city: String,
    region: String,
    country: String,
    date: { type: Date, default: Date.now }
});
const Visitor = mongoose.model("Visitor", visitorSchema);

// ----------------------
// Email (Nodemailer) Setup
// ----------------------
// Configure these in your environment (.env locally, or Vercel env vars):
//   EMAIL_HOST      e.g. smtp.gmail.com
//   EMAIL_PORT      e.g. 465 (SSL) or 587 (TLS)
//   EMAIL_USER      the sending mailbox address
//   EMAIL_PASS      an app password (NOT your normal login password)
//   EMAIL_FROM      optional friendly from, e.g. "HomeBoss <noreply@myhomeboss.com>"
let transporter = null;
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: Number(process.env.EMAIL_PORT) !== 587, // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    transporter.verify()
        .then(() => console.log("✉️  Email transporter ready"))
        .catch(err => console.error("⚠️  Email transporter not ready:", err.message));
} else {
    console.warn("⚠️  Email not configured — confirmation emails will be skipped. Set EMAIL_HOST/EMAIL_USER/EMAIL_PASS.");
}

// Builds and sends the prototype confirmation email
async function sendPrototypeConfirmation({ fullName, email, role }) {
    if (!transporter) {
        console.warn(`Skipping confirmation email to ${email} (email not configured).`);
        return;
    }

    const roleLine = {
        investor: "as a potential investor",
        customer: "as a potential customer",
        spectator: "as a spectator"
    }[role] || "";

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#0A0A0A;color:#ffffff;padding:32px;border-radius:16px;max-width:560px;margin:0 auto;">
        <h1 style="font-size:24px;margin:0 0 8px;background:linear-gradient(135deg,#007BFF,#00D4FF);-webkit-background-clip:text;background-clip:text;color:#00D4FF;">HomeBoss</h1>
        <h2 style="font-size:20px;margin:0 0 16px;color:#ffffff;">You're on the list! 🎉</h2>
        <p style="color:#d0d0d0;line-height:1.6;">Hi ${fullName},</p>
        <p style="color:#d0d0d0;line-height:1.6;">
            Thanks for registering ${roleLine} for the <strong style="color:#00D4FF;">HomeBoss Prototype Launch</strong>.
            We've saved your spot for the big reveal on:
        </p>
        <div style="background:rgba(0,123,255,0.12);border:1px solid rgba(0,123,255,0.4);border-radius:12px;padding:18px;text-align:center;margin:20px 0;">
            <div style="font-size:22px;font-weight:700;color:#ffffff;">August 8, 2026</div>
            <div style="font-size:13px;color:#9fb7d6;margin-top:4px;">Prototype Launch Day</div>
        </div>
        <p style="color:#d0d0d0;line-height:1.6;">
            We'll email you the event details, access link, and everything you need closer to the date. Keep an eye on your inbox.
        </p>
        <p style="color:#d0d0d0;line-height:1.6;margin-top:24px;">— The HomeBoss Team, Optimus Technologies</p>
    </div>`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `HomeBoss <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "You're registered for the HomeBoss Prototype Launch 🚀",
        html,
        text: `Hi ${fullName}, thanks for registering ${roleLine} for the HomeBoss Prototype Launch on August 8, 2026. We'll email you the event details closer to the date. — The HomeBoss Team`
    });
}

// ----------------------
// Middleware
// ----------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------
// Routes
// ----------------------

// Root Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// About Page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "about.html"));
});

// Blog Page
app.get("/blog",(req, res) => {
    res.sendFile(path.join(__dirname, "public", "blog.html"));
});

// Prototype Launch Waitlist Page
app.get("/prototype", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "prototype.html"));
});

// ----------------------
// Prototype Registration Endpoint
// ----------------------
app.post("/api/prototype-register", async (req, res) => {
    try {
        let { fullName, phone, countryCode, email, role } = req.body;

        // Basic validation
        fullName = (fullName || "").trim();
        phone = (phone || "").trim();
        email = (email || "").trim().toLowerCase();
        role = (role || "").trim().toLowerCase();

        if (!fullName || !phone || !email || !role) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValid) {
            return res.status(400).json({ success: false, error: "Please enter a valid email address." });
        }

        if (!["investor", "customer", "spectator"].includes(role)) {
            return res.status(400).json({ success: false, error: "Please select how you'll be joining." });
        }

        // Save to MongoDB
        const registration = await PrototypeRegistration.create({
            fullName,
            phone,
            countryCode: (countryCode || "").trim(),
            email,
            role
        });

        // Send confirmation email (non-blocking for the user experience,
        // but we await so we can surface delivery problems if needed)
        try {
            await sendPrototypeConfirmation({ fullName, email, role });
        } catch (mailErr) {
            console.error("Confirmation email failed:", mailErr.message);
            // Registration still succeeded — don't fail the whole request
        }

        res.json({ success: true, message: "Registration successful", id: registration._id });
    } catch (err) {
        // Duplicate email (unique index)
        if (err.code === 11000) {
            return res.status(409).json({ success: false, error: "This email is already registered for the prototype launch." });
        }
        console.error("Prototype registration error:", err.message);
        res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
    }
});

// ----------------------
// Visitor Tracking Endpoint
// ----------------------
app.post("/api/track-visit", async (req, res) => {
    try {
        // Check if visitor already has a cookie
        const visitorCookie = req.cookies.homeboss_visitor;
        if (visitorCookie) {
            return res.json({ message: "Visitor already counted" });
        }

        // Get client IP
        let clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
        if (clientIp.startsWith("::ffff:")) clientIp = clientIp.replace("::ffff:", "");

        // Skip private/local IPs
        const privateIp = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))/;
        let geo = { city: "Local Network", region: "Local Network", country: "Local Network" };

        if (!privateIp.test(clientIp) && clientIp !== "127.0.0.1") {
            try {
                const geoRes = await axios.get(`https://ipapi.co/${clientIp}/json/`);
                geo = {
                    city: geoRes.data.city || "Unknown",
                    region: geoRes.data.region || "Unknown",
                    country: geoRes.data.country_name || "Unknown"
                };
            } catch (err) {
                console.error("Geo API failed:", err.message);
            }
        }

        // Save to MongoDB
        const visitor = await Visitor.create({
            ip: clientIp,
            city: geo.city,
            region: geo.region,
            country: geo.country
        });

        // Set a 30-day cookie to prevent double-counting
        res.cookie("homeboss_visitor", visitor._id.toString(), {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true
        });

        res.json({ success: true, visitor });
    } catch (err) {
        console.error("Visitor tracking error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------------
// Visitor Analytics Endpoint
// ----------------------
app.get("/api/visitors", async (req, res) => {
    try {
        const total = await Visitor.countDocuments();
        const areas = await Visitor.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ total, areas });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------
// Health Check
// ----------------------
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "HomeBoss Website"
    });
});

// ----------------------
// 404 Redirect
// ----------------------
app.use((req, res) => res.redirect("/"));

// ----------------------
// Error Handling
// ----------------------
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// ----------------------
// Start Server
// ----------------------
app.listen(PORT, () => {
    console.log(`🏠 HomeBoss server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
});

module.exports = app;
