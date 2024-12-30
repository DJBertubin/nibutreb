import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid'; // Use nanoid for generating unique client IDs

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
    clientId: { type: String, unique: true, required: true }, // Unique Client ID
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'client' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Generate a custom client ID
const generateClientId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', 16);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password, role } = req.body;

    try {
        // Step 1: Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Step 2: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 3: Generate unique client ID
        const clientId = generateClientId();

        // Step 4: Create and save the user with the generated clientId
        const newUser = new User({
            clientId,
            username,
            password: hashedPassword,
            role: role || 'client',
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            clientId, // Return the generated clientId
        });
    } catch (err) {
        console.error('Error in signup:', err);

        // Return a generic error as JSON
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
}