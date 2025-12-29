import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String },
    source: { type: String },
    keyword: { type: String }, // Added keyword
    category: { type: String, default: 'General' },
    sentiment: { type: String, default: 'Neutral' },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicates per user
BookmarkSchema.index({ userId: 1, url: 1 }, { unique: true });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
