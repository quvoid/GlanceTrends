import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
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

// GET: Messages between current user and a friend
export async function GET(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const friendId = searchParams.get('friendId');

        if (!friendId) return NextResponse.json({ error: 'Missing friendId' }, { status: 400 });

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: friendId },
                { sender: friendId, recipient: userId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat history check

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Message Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { recipientId, content, type = 'text', metadata = {} } = body;

        const message = await Message.create({
            sender: userId,
            recipient: recipientId,
            content,
            type,
            metadata
        });

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error('Message Send Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
