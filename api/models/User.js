const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    name: { type: String, required: true }, // Add the `name` field
    shopifyData: { type: Object, default: {} },
    shopifyUrl: { type: String },
    shopifyToken: { type: String },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);