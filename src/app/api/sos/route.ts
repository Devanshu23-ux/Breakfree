import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// POST /api/sos — award 10 pts for completing a craving SOS activity
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.points += 10;
    await user.save();

    return NextResponse.json({ pointsEarned: 10, totalPoints: user.points, user });
  } catch (err) {
    console.error('POST /api/sos error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
