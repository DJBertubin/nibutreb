const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    productId: { type: String, required: true },
    mappings: { type: Object, required: true }, // Store attribute mappings
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Mapping || mongoose.model('Mapping', MappingSchema);