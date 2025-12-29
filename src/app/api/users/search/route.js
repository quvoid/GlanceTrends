import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
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

export async function GET(request) {
    try {
        await dbConnect();
        const currentUserId = await getUserFromToken(); // Optional: filter out self

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [] });
        }

        // Case-insensitive search for name or email
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('_id name email') // Don't return passwords!
            .limit(10);

        // Filter out self
        const filteredUsers = users.filter(u => u._id.toString() !== currentUserId);

        return NextResponse.json({ users: filteredUsers });
    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
