const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./api/routes/authRoutes');  // Should export a router function
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

// Ensure the imported routes are functions
console.log('authRoutes type:', typeof authRoutes);  // Should print "function"

// Routes
app.use('/api/auth', authRoutes);  // Ensure this is a function
app.use('/api/shopify', shopifyRoutes);
app.use('/api/walmart', walmartRoutes);
app.use('/api/mappings', mappingRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));