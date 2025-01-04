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

// Function to send MP_ITEM feed to Walmart
export async function sendItemToWalmart(itemData) {
    try {
        const accessToken = await getWalmartAccessToken();
        const requestId = crypto.randomUUID();

        const response = await fetch(`${WALMART_API_URL}?feedType=MP_ITEM`, {
            method: 'POST',
            headers: {
                'WM_SEC.ACCESS_TOKEN': accessToken,
                'WM_CONSUMER.CHANNEL.TYPE': CLIENT_ID,
                'WM_QOS.CORRELATION_ID': requestId,
                'WM_SVC.NAME': 'Walmart Item Export',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: itemData }),
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