import mongoose from 'mongoose';

const WalmartDataSchema = new mongoose.Schema({
    walmartClientId: { type: String, required: true },
    clientSecret: { type: String, required: true },
    linkedToClientId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WalmartData || mongoose.model('WalmartData', WalmartDataSchema);