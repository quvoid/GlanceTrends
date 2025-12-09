import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    articleUrl: { type: String, required: true, index: true },
    type: { type: String, required: true }, // 'like' or 'comment'
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);
