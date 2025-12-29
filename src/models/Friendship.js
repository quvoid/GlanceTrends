import mongoose from 'mongoose';

const FriendshipSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

// Ensure uniqueness (A->B is same as B->A effectively, but we handle that in logic or compound index)
// For simplicity, we'll check existence manually or use a unique index if we enforce an order.
// Here we'll just index them for lookup speed.
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.models.Friendship || mongoose.model('Friendship', FriendshipSchema);
