const mongoose = require('mongoose');
const { nanoid } = require('nanoid'); // For generating unique client IDs

const UserSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        default: () => nanoid(), // Generate unique ID
    },
    name: { type: String, required: true }, // Ensure `name` is required
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' }, // Default role is `client`
    shopifyData: { type: Object, default: {} },
    shopifyUrl: { type: String, unique: false },
    shopifyToken: { type: String },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);