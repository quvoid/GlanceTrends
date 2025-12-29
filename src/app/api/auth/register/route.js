import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        await dbConnect();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate handle (e.g. John Doe -> @johndoe123)
        const baseHandle = name.toLowerCase().replace(/\s+/g, '');
        const uniqueSuffix = Math.floor(Math.random() * 10000);
        const handle = `@${baseHandle}${uniqueSuffix}`;

        // Default avatar
        const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            handle,
            image,
            bio: 'New to GlanceTrends!',
            verified: false
        });

        return NextResponse.json({ success: true, userId: user._id });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
