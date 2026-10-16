import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// POST /api/login — verify username + password, return user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      // Use same message to prevent username enumeration
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Return user without passwordHash
    const userObj = user.toObject();
    const { passwordHash: _, ...safeUser } = userObj;
    return NextResponse.json({ user: { ...safeUser, _id: safeUser._id.toString() } });
  } catch (err) {
    console.error('POST /api/login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
