import fetch from 'node-fetch';
import crypto from 'crypto';

// Walmart API constants
const WALMART_API_URL = "https://marketplace.walmartapis.com/v3/feeds";
const CLIENT_ID = process.env.WALMART_CLIENT_ID;
const CLIENT_SECRET = process.env.WALMART_CLIENT_SECRET;

// Function to get Walmart access token
async function getWalmartAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await fetch("https://marketplace.walmartapis.com/v3/token", {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Walmart access token. ${errorText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
        throw new Error('Access token missing in the response');
    }

    return data.access_token;
}

// **Transform the payload to Walmart MP_ITEM Spec 4.8 format**
function formatPayloadForWalmart(product) {
    return {
        sku: product.sku || "N/A",  // SKU of the item
        productName: product.title || "Untitled Product",
        productId: "0123456789012", // Replace with the actual GTIN/UPC/EAN for the item
        productIdType: "GTIN", // Valid options: GTIN, UPC, EAN
        shortDescription: "A dietary supplement to support gut health with 120 capsules.",
        mainImageUrl: product.image || "https://via.placeholder.com/300", // Replace with actual product image URL
        productSecondaryImageURL: [],  // Optional secondary images
        brand: "HealthX",  // Replace with actual brand name
        price: {
            currency: "USD",
            amount: parseFloat(product.price) || 0.0,
        },
        condition: "New",
        shippingWeight: {
            value: 0.5,  // Replace with actual weight in pounds
            unit: "LB",
        },
        fulfillmentLagTime: 2,  // Default: 2-day fulfillment time
        inventory: {
            quantity: product.inventory || 0,
            fulfillmentLagTime: 2,
        },
        category: "Supplements",  // Adjust based on product category
    };
}

// Function to send MP_ITEM feed to Walmart
export async function sendItemToWalmart(itemData) {
    if (!itemData || !itemData.items || itemData.items.length === 0) {
        throw new Error('Item data is required.');
    }

    // Transform the items to match Walmart’s MP_ITEM spec
    const formattedItems = itemData.items.map(formatPayloadForWalmart);

    const payload = {
        MPItemFeedHeader: {
            version: "4.8",  // Ensure this matches Walmart spec version
            requestBatchId: `BATCH-${crypto.randomUUID()}`,
        },
        MPItem: formattedItems,  // List of formatted items
    };

    try {
        const accessToken = await getWalmartAccessToken();
        const requestId = crypto.randomUUID();  // Unique correlation ID for Walmart API request tracking

        const response = await fetch(`${WALMART_API_URL}?feedType=MP_ITEM`, {
            method: 'POST',
            headers: {
                'WM_SEC.ACCESS_TOKEN': accessToken,
                'WM_CONSUMER.CHANNEL.TYPE': CLIENT_ID,
                'WM_QOS.CORRELATION_ID': requestId,
                'WM_SVC.NAME': 'Walmart Item Export',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),  // Send the formatted payload as JSON
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Walmart API Error: ${errorText}`);
        }

        const result = await response.json();
        return { success: true, message: 'Items successfully sent to Walmart', feedId: result.feedId };
    } catch (error) {
        return { success: false, message: error.message };
    }
}