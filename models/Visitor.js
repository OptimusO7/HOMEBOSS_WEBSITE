const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: String,
    city: String,
    region: String,
    country: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', visitorSchema);
