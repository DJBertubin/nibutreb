const express = require('express');
const router = express.Router();
const users = { admin: 'password123' }; // Replace with your user database logic

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userPassword = users[username];
    if (password === userPassword) {
        req.session.user = { username, role: 'admin' };
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;
