import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET /api/leaderboard — returns top 10 users sorted by points
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('name habit customHabit points streak')
      .lean();

    const leaderboard = users.map((u, i) => ({
      _id: u._id.toString(),
      name: u.name,
      habit: u.habit === 'custom' ? u.customHabit : u.habit,
      points: u.points,
      streak: u.streak,
      rank: i + 1,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
