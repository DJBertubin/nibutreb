const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// **Login Controller**
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ clientId: user.clientId, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role, name: user.name, clientId: user.clientId });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// **Signup Controller**
exports.signup = async (req, res) => {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, password: hashedPassword, role: role || 'client' });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};