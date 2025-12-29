import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
