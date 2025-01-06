const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection with options
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit the server if MongoDB connection fails
    });

// User Schema with clientId
const UserSchema = new mongoose.Schema({
    clientId: { type: String, unique: true, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Main login handler for Express
module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        console.error('❌ Invalid HTTP method');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        console.error('❌ Missing username or password');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log(`🔍 Login request received for username: ${username}`);

        // Check if the user exists in the database
        const user = await User.findOne({ username });
        console.log('Database user:', user);

        if (!user) {
            console.error(`❌ User ${username} not found in the database`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔑 Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            console.error('❌ Invalid password attempt');
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Ensure JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET is missing in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { clientId: user.clientId, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ Login successful for:', username);

        res.status(200).json({
            token,
            role: user.role,
            clientId: user.clientId,
        });
    } catch (err) {
        console.error('❗ Login Error:', err.stack); // Log the full stack trace for better debugging
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};