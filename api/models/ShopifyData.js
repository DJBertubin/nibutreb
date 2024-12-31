const mongoose = require('mongoose');

const ShopifyDataSchema = new mongoose.Schema({
    clientId: { type: String, required: true }, // Link to the user's clientId
    shopifyUrl: { type: String, required: true },
    shopifyToken: { type: String, required: true },
    shopifyData: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }, // Timestamp for tracking creation
    updatedAt: { type: Date, default: Date.now }, // Timestamp for the last data update
    lastUpdated: { type: Date, default: Date.now }, // Timestamp for the last successful fetch
});

module.exports =
    mongoose.models.ShopifyData || mongoose.model('ShopifyData', ShopifyDataSchema);