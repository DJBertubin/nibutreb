import mongoose from 'mongoose';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import ShopifyData from '../../models/ShopifyData';
import { sendItemToWalmart } from '../utils/sendToWalmart'; // Import sendToWalmart function

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authorization } = req.headers;
    const { storeUrl, adminAccessToken, exportToWalmart } = req.body; // Add exportToWalmart flag

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const trimmedStoreUrl = storeUrl.trim().toLowerCase();
    const shopifyApiUrl = `https://${trimmedStoreUrl}/admin/api/2024-01/products.json`;

    try {
        // Decode JWT token to identify the requesting user
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Fetch data from Shopify API
        const response = await fetch(shopifyApiUrl, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': adminAccessToken,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Shopify API Error:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const shopifyData = await response.json();

        if (!shopifyData.products || shopifyData.products.length === 0) {
            return res.status(404).json({ error: 'No products found in the Shopify store.' });
        }

        // Format data to include all product variants with correct image mapping
        const formattedProducts = shopifyData.products.flatMap((product) => {
            if (!product.variants || product.variants.length === 0) {
                return [{
                    id: product.id,
                    product_id: product.id,
                    title: product.title || 'Untitled Product',
                    price: 'N/A',
                    sku: 'N/A',
                    inventory: 0,
                    created_at: product.created_at || new Date().toISOString(),
                    sourceCategory: product.product_type || 'N/A',
                    image: product.images?.[0]?.src || 'https://via.placeholder.com/50',
                    description: product.body_html || '',
                }];
            }

            return product.variants.map((variant) => {
                let variantImage = product.images?.find((img) => img.id === variant.image_id) ||
                                   product.images?.find((img) => img.variant_ids?.includes(variant.id));

                if (!variantImage && product.images?.length > 0) {
                    variantImage = product.images[0]; // Fallback to the first image
                }

                return {
                    id: variant.id,
                    product_id: product.id,
                    title: `${product.title} (${variant.title || 'Default Variant'})`,
                    price: variant.price || '0.00',
                    sku: variant.sku || 'N/A',
                    inventory: variant.inventory_quantity || 0,
                    created_at: product.created_at || '',
                    sourceCategory: product.product_type || 'N/A',
                    image: variantImage?.src || 'https://via.placeholder.com/50',
                    description: product.body_html || '',
                };
            });
        });

        // Save formatted Shopify data to the database
        const updatedShopifyData = await ShopifyData.findOneAndUpdate(
            { clientId, shopifyUrl: trimmedStoreUrl },
            {
                shopifyUrl: trimmedStoreUrl,
                shopifyToken: adminAccessToken,
                products: formattedProducts,
                lastUpdated: new Date(),
            },
            { upsert: true, new: true }
        );

        console.log('Shopify Data Saved:', updatedShopifyData);

        // Export to Walmart if the flag is set
        if (exportToWalmart) {
            const walmartResponse = await sendItemToWalmart(formattedProducts);
            if (!walmartResponse.success) {
                return res.status(500).json({ error: `Walmart export failed: ${walmartResponse.message}` });
            }

            console.log('Items sent to Walmart successfully:', walmartResponse);
            return res.status(201).json({
                message: 'Shopify data fetched, stored, and sent to Walmart successfully.',
                shopifyData: formattedProducts,
                walmartFeedId: walmartResponse.feedId,
            });
        }

        res.status(201).json({
            message: 'Shopify data fetched and stored successfully.',
            shopifyData: formattedProducts,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}