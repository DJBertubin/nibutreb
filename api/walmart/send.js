import { sendItemToWalmart } from '../../utils/sendToWalmart';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items } = req.body; // Expecting "items" array from request body

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No item data provided.' });
        }

        // Prepare item data as required for Walmart
        const formattedData = {
            MPItemFeedHeader: {
                version: "4.8",
                requestBatchId: `BATCH-${Date.now()}`,
            },
            MPItem: items.map((item) => ({
                sku: item.sku || 'N/A',
                productName: item.title || 'Unnamed Product',
                productId: item.productId || '123456789012', // Placeholder for GTIN
                productIdType: 'GTIN', // Must align with the actual productId type
                shortDescription: item.shortDescription || 'Short description for the product.',
                brand: item.brand || 'Unknown Brand',
                mainImageUrl: item.image || 'https://via.placeholder.com/150',
                price: {
                    currency: 'USD',
                    amount: parseFloat(item.price || 0.0),
                },
                condition: 'New', // Typically "New" unless specified otherwise
                shippingWeight: {
                    value: 1.0, // Example value, change as needed
                    unit: 'LB',
                },
                inventory: {
                    quantity: item.inventory || 0,
                    fulfillmentLagTime: 2, // Example value, change as needed
                },
            })),
        };

        const result = await sendItemToWalmart(formattedData); // Call the utility function

        if (result.success) {
            res.status(200).json({
                message: result.message,
                feedId: result.feedId,
            });
        } else {
            res.status(500).json({
                error: result.message || 'Failed to send data to Walmart.',
            });
        }
    } catch (error) {
        console.error('Error in API /api/walmart/send:', error.message);
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
}