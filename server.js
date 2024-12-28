const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal Server Error', details: err.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Internal Server Error', details: err.message });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error', details: err.message });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));