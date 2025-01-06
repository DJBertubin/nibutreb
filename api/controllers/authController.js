const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request:', { username }); // Track incoming request

    if (!username || !password) {
        console.error('Missing username or password in request');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log('Looking up user in database...');
        const user = await User.findOne({ username });
        console.log('User found:', user); // Track user lookup result

        if (!user) {
            console.error('User not found in database');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch); // Track password comparison

        if (!isMatch) {
            console.error('Password does not match');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { clientId: user.clientId, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('Token generated successfully:', token); // Track JWT generation

        res.status(200).json({ token, role: user.role, name: user.name, clientId: user.clientId });
    } catch (error) {
        console.error('Error during login:', error.message); // Log the error message
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.signup = async (req, res) => {
    const { name, username, password, role } = req.body;

    console.log('Received signup request:', { username });

    if (!name || !username || !password) {
        console.error('Missing signup fields');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        console.log('Checking if user already exists...');
        const existingUser = await User.findOne({ username });
        console.log('Existing user lookup:', existingUser); // Track existing user lookup

        if (existingUser) {
            console.error('Username already exists');
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully'); // Track successful password hashing

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            role: role || 'client',
        });

        await newUser.save();
        console.log('New user created successfully:', newUser); // Track successful user creation

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during signup:', error.message); // Log the error message
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};