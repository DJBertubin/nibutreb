const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating unique client IDs

const UserSchema = new mongoose.Schema({
    clientId: { type: String, required: true, unique: true, default: uuidv4 }, // Unique Client ID
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String }, // Optional Shopify store URL
    shopifyToken: { type: String }, // Optional Shopify access token
    shopifyData: { type: Object, default: {} }, // Optional Shopify data
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);