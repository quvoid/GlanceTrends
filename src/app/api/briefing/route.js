import { NextResponse } from 'next/server';
import { getBriefing } from '@/services/briefingService';
import Briefing from '@/models/Briefing';
import dbConnect from '@/lib/db';

export async function GET() {
    try {
        // Fetch the current briefing (lazy generation)
        const currentBriefing = await getBriefing();

        // Fetch past briefings (history)
        await dbConnect();

        // currentBriefing might not have _id if it was a fallback (not saved to DB)
        const query = currentBriefing._id ? { _id: { $ne: currentBriefing._id } } : {};
        const history = await Briefing.find(query)
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            latest: currentBriefing,
            history
        });
    } catch (error) {
        console.error('Briefing API Error:', error.message, error.stack);
        return NextResponse.json({
            error: 'Failed to generate briefing',
            detail: error.message
        }, { status: 500 });
    }
}
