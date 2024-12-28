const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = function handler(req, res) {
    const users = {
        admin: { password: bcrypt.hashSync('admin123', 10), role: 'admin' },
        client: { password: bcrypt.hashSync('client123', 10), role: 'client' },
    };

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users[username];
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, role: user.role });
};