import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs'; // Add bcrypt for password hashing

export async function PUT(request) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        await dbConnect();
        const { name, handle, bio, password } = await request.json(); // Destructure password as well

        // Validate handle uniqueness if it's being updated
        if (handle) {
            const existingUser = await User.findOne({ handle, _id: { $ne: payload.userId } });
            if (existingUser) {
                return NextResponse.json({ error: 'Handle already taken' }, { status: 400 });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (handle) updateData.handle = handle;
        if (bio) updateData.bio = bio;

        // Handle password update
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            payload.userId,
            updateData,
            { new: true }
        ).select('-password');

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        console.error('Update User Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
