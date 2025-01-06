const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./api/routes/authRoutes');
const shopifyRoutes = require('./api/routes/shopifyRoutes');
const walmartRoutes = require('./api/routes/walmartRoutes');
const mappingRoutes = require('./api/routes/mappingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB Connection Error:', err.message));

// Debug Route Types
console.log('authRoutes type:', typeof authRoutes);
console.log('shopifyRoutes type:', typeof shopifyRoutes);
console.log('walmartRoutes type:', typeof walmartRoutes);
console.log('mappingRoutes type:', typeof mappingRoutes);

// Routes
if (typeof authRoutes === 'function') {
    app.use('/api/auth', authRoutes);
} else {
    console.error('authRoutes is not a function. Check the export in authRoutes.js.');
}

if (typeof shopifyRoutes === 'function') {
    app.use('/api/shopify', shopifyRoutes);
} else {
    console.error('shopifyRoutes is not a function. Check the export in shopifyRoutes.js.');
}

if (typeof walmartRoutes === 'function') {
    app.use('/api/walmart', walmartRoutes);
} else {
    console.error('walmartRoutes is not a function. Check the export in walmartRoutes.js.');
}

if (typeof mappingRoutes === 'function') {
    app.use('/api/mappings', mappingRoutes);
} else {
    console.error('mappingRoutes is not a function. Check the export in mappingRoutes.js.');
}

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));