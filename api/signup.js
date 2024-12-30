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
        // Step 1: Validate inputs
        if (!name || !username || !password) {
            return res.status(400).json({ error: 'Name, username, and password are required.' });
        }

        // Step 2: Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Step 3: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 4: Create and save the user
        const newUser = new User({
            name, // Include `name` explicitly
            username,
            password: hashedPassword,
            role: role || 'client',
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            clientId: newUser.clientId, // Return the generated clientId
        });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
}