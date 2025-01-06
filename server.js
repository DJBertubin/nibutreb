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

// Middleware
app.use(cors()); // You can restrict origins like this: { origin: 'http://your-frontend-url' }
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1); // Exit the app if unable to connect
    });

// Routes
app.use('/api/auth', authRoutes);  // Auth routes: /login, /signup
app.use('/api/shopify', shopifyRoutes);  // Shopify API routes
app.use('/api/walmart', walmartRoutes);  // Walmart API routes
app.use('/api/mappings', mappingRoutes);  // Mapping-related routes

// Catch-All for Undefined Routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❗ Unhandled Server Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start the Server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Gracefully shutting down...');
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    server.close(() => {
        console.log('🛑 Server terminated');
        process.exit(0);
    });
});