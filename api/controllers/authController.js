const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || '';

console.log('JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    console.log('Received login request:', { username });

    if (!username || !password) {
        console.error('❌ Missing username or password');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        console.log('🔍 Looking up user in database...');
        const user = await User.findOne({ username });

        if (!user) {
            console.error('❌ User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.password) {
            console.error('❌ Password is missing in user document');
            return res.status(500).json({ error: 'Password missing in database. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('❌ Password does not match');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const tokenPayload = {
            clientId: user.clientId || 'unknown-client-id',
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        console.log('✅ Token generated successfully');

        res.status(200).json({
            token,
            role: user.role,
            name: user.name,
            clientId: user.clientId,
        });
    } catch (error) {
        console.error('❗ Error during login:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.signup = async (req, res) => {
    const { name, username, password, role } = req.body;

    console.log('Received signup request:', { username });

    if (!name || !username || !password) {
        console.error('❌ Missing signup fields');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        console.log('🔍 Checking if user already exists...');
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            console.error('❌ Username already exists');
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed successfully');

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            role: role || 'client',
        });

        await newUser.save();
        console.log('✅ New user created successfully');

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('❗ Error during signup:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};