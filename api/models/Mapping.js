const mongoose = require('mongoose');

const MappingSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    mapping: { type: Object, required: true }, // Store attribute mappings as an object
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mapping', MappingSchema);