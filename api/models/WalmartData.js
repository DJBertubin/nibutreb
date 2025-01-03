const mongoose = require('mongoose');

const WalmartDataSchema = new mongoose.Schema({
    clientId: { type: String, required: true },  // Link to the user
    walmartClientID: { type: String, required: true },
    walmartClientSecret: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WalmartData', WalmartDataSchema);