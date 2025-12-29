import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bookmark from '@/models/Bookmark';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return payload.userId;
    } catch (e) {
        return null;
    }
}

// GET: List user's bookmarks
export async function GET(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error('Bookmark Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Add a bookmark
export async function POST(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { url, title, summary, source, category, sentiment, keyword } = body;

        // Check if already exists
        const exists = await Bookmark.findOne({ userId, url });
        if (exists) {
            return NextResponse.json({ success: true, message: 'Already bookmarked' });
        }

        const bookmark = await Bookmark.create({
            userId,
            url,
            title,
            summary,
            source,
            category,
            sentiment,
            keyword: keyword || 'General' // Fallback
        });

        return NextResponse.json({ success: true, bookmark });
    } catch (error) {
        console.error('Bookmark Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove a bookmark
export async function DELETE(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'Missing article URL' }, { status: 400 });
        }

        await Bookmark.deleteOne({ userId, url });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bookmark Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
