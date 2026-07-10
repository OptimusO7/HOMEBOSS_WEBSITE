const mongoose = require("mongoose");

const prototypeRegistrationSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    // Full phone number in international format, e.g. "+233206782232"
    phone: { type: String, required: true, trim: true },
    // Dial code kept separately for easy analytics, e.g. "+233"
    countryCode: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    // How the person wants to join the prototype launch
    role: {
        type: String,
        required: true,
        enum: ["investor", "customer", "spectator"]
    },
    date: { type: Date, default: Date.now }
});

// Prevent the same email from registering twice
prototypeRegistrationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("PrototypeRegistration", prototypeRegistrationSchema);
