const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Dummy user data (use a database in production)
const users = {
    admin: bcrypt.hashSync('admin123', 10),
    client: bcrypt.hashSync('client123', 10),
};

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = users[username];
    if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const role = username === 'admin' ? 'admin' : 'client';
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Example protected route
app.get('/api/protected', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        res.status(200).json({ message: 'Protected Data', user });
    });
});

// Catch-All for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});