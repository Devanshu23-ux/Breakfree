import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// POST /api/user — register a new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, username, password, habit, customHabit, quitStartTime, moneySavedPerDay } = body;

    // Validate required fields
    if (!name || !username || !password || !habit || !quitStartTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['smoking', 'alcohol', 'custom'].includes(habit)) {
      return NextResponse.json({ error: 'Invalid habit value' }, { status: 400 });
    }
    if (habit === 'custom' && !customHabit) {
      return NextResponse.json({ error: 'Custom habit name required' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    // Check if username already taken
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken. Choose another.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      passwordHash,
      habit,
      customHabit: customHabit?.trim(),
      quitStartTime: new Date(quitStartTime),
      moneySavedPerDay: Number(moneySavedPerDay) || 0,
      points: 0,
      streak: 0,
    });

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = user.toObject();
    return NextResponse.json({ user: { ...safeUser, _id: safeUser._id.toString() } }, { status: 201 });
  } catch (err) {
    console.error('POST /api/user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
