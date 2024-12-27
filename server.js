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

    const token = jwt.sign({ username, role: username === 'admin' ? 'admin' : 'client' }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
if (process.env.NODE_ENV !== 'vercel') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app; // Export for Vercel