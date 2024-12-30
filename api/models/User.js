const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyUrl: { type: String },
    shopifyToken: { type: String },
    shopifyData: { type: Object, default: {} }, // Added shopifyData field
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);