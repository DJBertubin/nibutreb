import { Storage } from '@google-cloud/storage';
import path from 'path';

const bucketName = process.env.GCLOUD_BUCKET;

// Set the path to the service account key
const keyFilename = path.join(process.cwd(), 'google-cloud-key.json');

const storage = new Storage({ projectId: process.env.GCLOUD_PROJECT, keyFilename });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const fileName = 'MP_ITEM_SPEC.json';
        const file = storage.bucket(bucketName).file(fileName);

        const [contents] = await file.download();

        // Send the file contents to Walmart API
        const walmartApiUrl = 'https://marketplace.walmartapis.com/v3/feeds?feedType=MP_ITEM';

        const response = await fetch(walmartApiUrl, {
            method: 'POST',
            headers: {
                'WM_SEC.ACCESS_TOKEN': 'your-access-token',
                'WM_QOS.CORRELATION_ID': 'unique-id',
                'WM_SVC.NAME': 'Walmart Service',
                'Content-Type': 'multipart/form-data',
            },
            body: contents,
        });

        const result = await response.json();
        res.status(200).json({ message: 'File sent successfully!', result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch file', details: error.message });
    }
}