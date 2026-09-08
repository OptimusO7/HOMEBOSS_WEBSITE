const mongoose = require("mongoose");

const waitlistSignupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    // Normalised bucket so the list is easy to segment
    interest: {
        type: String,
        required: true,
        enum: ["customer", "investor", "other"]
    },
    // The exact label the person picked, e.g. "Investor · Investment Opportunity"
    interestLabel: { type: String, trim: true },
    // Free text they typed when choosing "Other"
    otherInterest: { type: String, trim: true, default: "" },
    consent: { type: Boolean, default: true },
    source: { type: String, trim: true, default: "website" },
    date: { type: Date, default: Date.now }
});

// One signup per email address
waitlistSignupSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("WaitlistSignup", waitlistSignupSchema);