import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friendship from '@/models/Friendship';
import User from '@/models/User'; // Populate needs this
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

// GET: List friends and requests
export async function GET(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Find all friendships where I am requester OR recipient
        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }]
        }).populate('requester', 'name email').populate('recipient', 'name email');

        // Transform to cleaner format
        const friends = [];
        const pendingSent = [];
        const pendingReceived = [];

        friendships.forEach(f => {
            const isRequester = f.requester._id.toString() === userId;
            const friend = isRequester ? f.recipient : f.requester;

            if (f.status === 'accepted') {
                friends.push({
                    friendId: friend._id,
                    name: friend.name,
                    email: friend.email,
                    status: 'accepted'
                });
            } else if (f.status === 'pending') {
                if (isRequester) {
                    pendingSent.push({
                        friendId: friend._id,
                        name: friend.name,
                        email: friend.email
                    });
                } else {
                    pendingReceived.push({
                        requestId: f._id, // Need this to accept
                        friendId: friend._id,
                        name: friend.name,
                        email: friend.email
                    });
                }
            }
        });

        return NextResponse.json({ friends, pendingSent, pendingReceived });
    } catch (error) {
        console.error('Friends Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// POST: Send Request or Accept
export async function POST(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { action, targetUserId, requestId } = body;

        if (action === 'request') {
            // Check if exists
            const existing = await Friendship.findOne({
                $or: [
                    { requester: userId, recipient: targetUserId },
                    { requester: targetUserId, recipient: userId }
                ]
            });

            if (existing) {
                if (existing.status === 'accepted') return NextResponse.json({ error: 'Already friends' });
                return NextResponse.json({ error: 'Request already pending' });
            }

            const newFriendship = await Friendship.create({
                requester: userId,
                recipient: targetUserId,
                status: 'pending'
            });
            return NextResponse.json({ success: true, friendship: newFriendship });

        } else if (action === 'accept') {
            const friendship = await Friendship.findById(requestId);
            if (!friendship) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

            // Verify I am the recipient
            if (friendship.recipient.toString() !== userId) {
                return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
            }

            friendship.status = 'accepted';
            await friendship.save();
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Friends Action Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
