const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Use bcryptjs for compatibility in Node.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Updated User Schema
const UserSchema = new mongoose.Schema({
    clientId: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const loginHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT including clientId
        const token = jwt.sign(
            { clientId: user.clientId, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            role: user.role,
            clientId: user.clientId,
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = loginHandler; // Export for Node.js