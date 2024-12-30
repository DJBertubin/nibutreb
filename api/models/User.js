const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String }, // Store the Shopify store URL
    shopifyToken: { type: String }, // Store the Shopify Admin Access Token
    shopifyData: { type: Object, default: {} }, // Store fetched Shopify data
});

module.exports = mongoose.model('User', UserSchema);