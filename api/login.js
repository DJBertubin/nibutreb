import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB Connection Error:', err.message));

// User Schema with clientId
const UserSchema = new mongoose.Schema({
    clientId: { type: String, unique: true, required: true }, // Custom unique client ID
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Main login handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    // Check if the required fields are provided
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log('Login request received:', { username });

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            console.warn('User not found:', username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.warn('Invalid password attempt for username:', username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if JWT_SECRET is present
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { clientId: user.clientId, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful for:', username);

        // Send the response back to the client
        res.status(200).json({
            token,
            role: user.role,
            clientId: user.clientId,
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
}