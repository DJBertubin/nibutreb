// Import required modules
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Walmart data schema for MongoDB
const walmartSchema = new mongoose.Schema({
  clientID: { type: String, required: true },
  clientSecret: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a model for Walmart data
const WalmartData = mongoose.model('WalmartData', walmartSchema, 'walmartdatas');

// API route to save Walmart credentials
router.post('/credentials', async (req, res) => {
  const { clientID, clientSecret } = req.body;

  if (!clientID || !clientSecret) {
    return res.status(400).json({ error: 'Client ID and Client Secret are required.' });
  }

  try {
    const newWalmartData = new WalmartData({ clientID, clientSecret });
    await newWalmartData.save(); // Save to the `walmartdatas` collection in MongoDB
    res.status(201).send({ message: 'Walmart credentials saved successfully!' });
  } catch (error) {
    console.error('Error saving Walmart credentials:', error);
    res.status(500).send({ error: 'Failed to save Walmart credentials' });
  }
});

module.exports = router;