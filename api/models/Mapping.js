const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
    clientId: { type: String, required: true },
    productId: { type: String, required: true },
    mappings: { type: Object, required: true },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mapping', mappingSchema);