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
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/walmart', walmartRoutes);
app.use('/api/mappings', mappingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));