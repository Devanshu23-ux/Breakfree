import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { computeCheckinResult } from '@/lib/gameLogic';

// POST /api/checkin — award 50 pts for daily check-in, update streak
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { newStreak, bonusPoints, alreadyCheckedIn } = computeCheckinResult(
      user.lastCheckin?.toISOString() ?? null,
      user.streak
    );

    if (alreadyCheckedIn) {
      return NextResponse.json({
        message: 'Already checked in today',
        alreadyCheckedIn: true,
        user,
      });
    }

    const BASE_POINTS = 50;
    user.points += BASE_POINTS + bonusPoints;
    user.streak = newStreak;
    user.lastCheckin = new Date();
    await user.save();

    return NextResponse.json({
      message: 'Check-in successful',
      alreadyCheckedIn: false,
      pointsEarned: BASE_POINTS + bonusPoints,
      bonusPoints,
      newStreak,
      user,
    });
  } catch (err) {
    console.error('POST /api/checkin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
