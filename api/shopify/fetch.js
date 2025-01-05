import mongoose from 'mongoose';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import ShopifyData from '../../models/ShopifyData';
import { sendItemToWalmart } from '../utils/sendToWalmart';

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { authorization } = req.headers;
    const { storeUrl, adminAccessToken, exportToWalmart } = req.body;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized. Token missing.' });
    }

    if (!storeUrl || !adminAccessToken) {
        return res.status(400).json({ error: 'Store URL and Admin Access Token are required.' });
    }

    const trimmedStoreUrl = storeUrl.trim().toLowerCase();
    const shopifyApiBaseUrl = `https://${trimmedStoreUrl}/admin/api/2024-01/products.json?limit=250`;

    try {
        // Decode JWT token to identify the requesting user
        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const clientId = decoded.clientId;

        if (!clientId) {
            return res.status(401).json({ error: 'Invalid or missing clientId in token.' });
        }

        // Fetch all products from Shopify API (with pagination)
        let allProducts = [];
        let nextPageUrl = shopifyApiBaseUrl;
        let pageCount = 1;

        console.log('Starting to fetch Shopify products...');

        while (nextPageUrl) {
            console.log(`Fetching page ${pageCount}...`);

            const response = await fetch(nextPageUrl, {
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': adminAccessToken,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Shopify API Error (Page ${pageCount}):`, errorText);
                return res.status(response.status).json({ error: errorText });
            }

            const shopifyData = await response.json();
            const products = shopifyData.products || [];

            console.log(`Fetched ${products.length} products from page ${pageCount}`);

            // Add to the master product list
            allProducts = [...allProducts, ...products];

            // Check for next page link in headers
            const linkHeader = response.headers.get('link');
            if (linkHeader && linkHeader.includes('rel="next"')) {
                const nextLinkMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
                nextPageUrl = nextLinkMatch ? nextLinkMatch[1] : null;
            } else {
                nextPageUrl = null; // No more pages
            }

            pageCount++;
        }

        if (allProducts.length === 0) {
            return res.status(404).json({ error: 'No products found in the Shopify store.' });
        }

        console.log(`Fetched a total of ${allProducts.length} products.`);

        // Format and batch save data to the database
        const batchSize = 500;
        for (let i = 0; i < allProducts.length; i += batchSize) {
            const batch = allProducts.slice(i, i + batchSize);
            const formattedBatch = batch.flatMap((product) => {
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

            console.log(`Saving batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allProducts.length / batchSize)}`);

            await ShopifyData.findOneAndUpdate(
                { clientId, shopifyUrl: trimmedStoreUrl },
                {
                    $push: { products: { $each: formattedBatch } },
                    shopifyToken: adminAccessToken,
                    lastUpdated: new Date(),
                },
                { upsert: true, new: true }
            );
        }

        console.log(`Saved all ${allProducts.length} products to MongoDB.`);

        // Export to Walmart if the flag is set
        if (exportToWalmart) {
            const walmartResponse = await sendItemToWalmart(allProducts);
            if (!walmartResponse.success) {
                return res.status(500).json({ error: `Walmart export failed: ${walmartResponse.message}` });
            }

            console.log('Items sent to Walmart successfully:', walmartResponse);
            return res.status(201).json({
                message: 'Shopify data fetched, stored, and sent to Walmart successfully.',
                shopifyData: allProducts,
                walmartFeedId: walmartResponse.feedId,
            });
        }

        res.status(201).json({
            message: `Shopify data fetched and stored successfully. Total products: ${allProducts.length}`,
            shopifyData: allProducts,
        });
    } catch (err) {
        console.error('Error saving Shopify data:', err.message);
        res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
    }
}