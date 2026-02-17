import mongoose from 'mongoose';

const BriefingSchema = new mongoose.Schema({
    type: { type: String, enum: ['morning', 'evening'], required: true },
    date: { type: String, required: true }, // e.g., "Feb 14, 2026"
    timeSlot: { type: String, required: true }, // e.g., "2026-02-14-morning" (unique index)
    title: { type: String, required: true },
    theme: { type: String }, // AI summary of the day's theme
    stories: [{
        headline: String,
        summary: String,
        source: String,
        category: String,
        url: String
    }],
    createdAt: { type: Date, default: Date.now }
});

// Ensure only one briefing per slot
BriefingSchema.index({ timeSlot: 1 }, { unique: true });

export default mongoose.models.Briefing || mongoose.model('Briefing', BriefingSchema);
