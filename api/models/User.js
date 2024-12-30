const mongoose = require('mongoose');
const { nanoid } = require('nanoid'); // Import nanoid

const userSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid(10), // Generate a unique 10-character client ID
    },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
    shopifyData: { type: Object, default: {} },
    shopifyUrl: { type: String },
    shopifyToken: { type: String },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);