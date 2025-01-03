const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // Variant ID
    product_id: { type: Number, required: true }, // Parent product ID
    title: { type: String, required: true }, // Variant title
    price: { type: String, required: true }, // Variant price
    sku: { type: String, required: true }, // SKU for the variant
    inventory: { type: Number, required: true }, // Inventory count
    image: { type: String, default: '' }, // Image URL for the variant
});

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // Product ID
    title: { type: String, required: true }, // Product title
    product_type: { type: String, default: 'N/A' }, // Product category
    created_at: { type: Date, required: true }, // Creation date
    variants: [VariantSchema], // Array of variants
    images: [{ id: Number, src: String }], // Images for the product
});

const ShopifyDataSchema = new mongoose.Schema({
    clientId: { type: String, required: true, index: true }, // Link to the user's clientId
    shopifyUrl: { type: String, required: true },
    shopifyToken: { type: String, required: true },
    products: [ProductSchema], // Store all products as an array
    createdAt: { type: Date, default: Date.now }, // Timestamp for tracking creation
    updatedAt: { type: Date, default: Date.now }, // Timestamp for the last data update
    lastUpdated: { type: Date, default: Date.now }, // Timestamp for the last successful fetch
});

module.exports =
    mongoose.models.ShopifyData || mongoose.model('ShopifyData', ShopifyDataSchema);