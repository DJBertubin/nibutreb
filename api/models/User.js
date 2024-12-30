const mongoose = require('mongoose');
const { nanoid } = require('nanoid'); // For generating unique client IDs

const UserSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid(), // Use nanoid to generate unique Client IDs
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyData: { type: Object, default: {} }, // Store Shopify data directly in User schema
    shopifyUrl: { type: String, unique: false }, // Optional, for store linking
    shopifyToken: { type: String }, // Store access token
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);