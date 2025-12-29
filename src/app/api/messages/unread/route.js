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

export async function GET() {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) return NextResponse.json({ count: 0 });

        const count = await Message.countDocuments({
            recipient: userId,
            read: false
        });

        return NextResponse.json({ count });
    } catch (error) {
        return NextResponse.json({ count: 0 });
    }
}
