import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../models/user'; // Import the User model

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, username, password, role } = req.body;

    try {
        // Validate required fields
        if (!name || !username || !password) {
            return res.status(400).json({ error: 'Name, username, and password are required.' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name, // Include the `name` field
            username,
            password: hashedPassword,
            role: role || 'client', // Default to `client`
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            userId: newUser._id, // Return MongoDB ID for reference
        });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
}