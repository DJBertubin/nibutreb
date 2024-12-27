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

// Dummy user data (replace with DB queries)
const users = {
    admin: bcrypt.hashSync('admin123', 10),
    client: bcrypt.hashSync('client123', 10),
};

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = users[username];
    if (!hashedPassword || !bcrypt.compareSync(password, hashedPassword)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const role = username === 'admin' ? 'admin' : 'client';
    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Protected Route Example
app.get('/api/client-data', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        if (user.role !== 'client') return res.status(403).json({ error: 'Forbidden' });

        const clientData = [{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }];
        res.status(200).json(clientData);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});