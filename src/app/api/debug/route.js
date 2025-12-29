import { NextResponse } from 'next/server';
import { getTrendingKeywords } from '@/services/trending';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('--- Debug Route Called ---');
        const start = Date.now();
        const result = await getTrendingKeywords();
        const duration = Date.now() - start;

        return NextResponse.json({
            success: true,
            duration,
            data: result
        });
    } catch (e) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
