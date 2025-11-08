// ============================================
// HOMEBOSS - NODE.JS SERVER (Enhanced Analytics)
// ============================================

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
const cookieParser = require("cookie-parser");
require("dotenv").config();

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
