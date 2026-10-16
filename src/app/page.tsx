'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getTimeFree,
  getMoneySaved,
  getLevel,
  getLevelProgress,
  getNextLevel,
  getBadges,
} from '@/lib/gameLogic';
import { IUser, IBadge } from '@/types';

// ─── TOAST COMPONENT ────────────────────────────────────────────────────────
function Toast({ message, type, show }: { message: string; type: 'success' | 'error'; show: boolean }) {
  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}

// ─── POINT BURST ─────────────────────────────────────────────────────────────
function PointBurst({ points, trigger }: { points: number; trigger: boolean }) {
  return (
    <div className={`point-burst ${trigger ? 'animate' : ''}`} aria-hidden="true">
      +{points} pts! 🎉
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFree, setTimeFree] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [pointBurst, setPointBurst] = useState({ show: false, points: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const triggerBurst = (points: number) => {
    setPointBurst({ show: true, points });
    setTimeout(() => setPointBurst({ show: false, points: 0 }), 1800);
  };

  // Load user
  const loadUser = useCallback(async () => {
    const userId = localStorage.getItem('breakfree_userId');
    if (!userId) { router.replace('/login'); return; }

    try {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) { localStorage.removeItem('breakfree_userId'); router.replace('/login'); return; }
      const data = await res.json();
      setUser(data.user);

      // Check if already checked in today
      if (data.user.lastCheckin) {
        const lastDate = new Date(data.user.lastCheckin).toDateString();
        if (lastDate === new Date().toDateString()) setAlreadyCheckedIn(true);
      }
    } catch {
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // Live timer
  useEffect(() => {
    if (!user) return;
    const tick = () => setTimeFree(getTimeFree(user.quitStartTime));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [user]);

  async function handleCheckin() {
    if (!user || alreadyCheckedIn || checkinLoading) return;
    setCheckinLoading(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.alreadyCheckedIn) {
        setAlreadyCheckedIn(true);
        showToast('Already checked in today! Come back tomorrow 🌅', 'success');
      } else {
        setUser(data.user);
        setAlreadyCheckedIn(true);
        triggerBurst(data.pointsEarned);
        const msg = data.bonusPoints > 0
          ? `🎉 ${data.newStreak}-day streak! +${data.pointsEarned} pts (bonus included!)`
          : `✅ Check-in done! +${data.pointsEarned} pts. Streak: ${data.newStreak} 🔥`;
        showToast(msg);
      }
    } catch {
      showToast('Check-in failed. Please try again.', 'error');
    } finally {
      setCheckinLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading your journey...</p>
      </div>
    );
  }

  if (!user) return null;

  const level = getLevel(user.points);
  const progress = getLevelProgress(user.points);
  const nextLevel = getNextLevel(user.points);
  const moneySaved = getMoneySaved(user.moneySavedPerDay, user.quitStartTime);
  const badges: IBadge[] = getBadges({
    points: user.points,
    streak: user.streak,
    quitStartTime: user.quitStartTime,
  });
  const habitLabel = user.habit === 'custom' ? (user.customHabit || 'Custom habit') : user.habit;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <PointBurst points={pointBurst.points} trigger={pointBurst.show} />

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🌿</span>
          <span className="app-logo-text">BreakFree</span>
        </div>
        <span className="header-greeting">Hi, {user.name} 👋</span>
      </header>

      <main className="page-content page-enter">
        {/* Timer Card */}
        <section aria-label="Free time counter">
          <div className="timer-card">
            <p className="timer-label">You have been free for</p>
            <div className="timer-display" aria-live="polite">
              <div className="timer-unit">
                <span className="timer-number">{timeFree.days}</span>
                <span className="timer-unit-label">Days</span>
              </div>
              <span className="timer-divider">:</span>
              <div className="timer-unit">
                <span className="timer-number">{pad(timeFree.hours)}</span>
                <span className="timer-unit-label">Hrs</span>
              </div>
              <span className="timer-divider">:</span>
              <div className="timer-unit">
                <span className="timer-number">{pad(timeFree.minutes)}</span>
                <span className="timer-unit-label">Min</span>
              </div>
              <span className="timer-divider">:</span>
              <div className="timer-unit">
                <span className="timer-number">{pad(timeFree.seconds)}</span>
                <span className="timer-unit-label">Sec</span>
              </div>
            </div>
            <span className="timer-habit-badge">
              {user.habit === 'smoking' ? '🚬' : user.habit === 'alcohol' ? '🍺' : '⚡'}
              &nbsp;{habitLabel} free
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-row" aria-label="Your stats">
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{user.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{user.points}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{moneySaved}</div>
            <div className="stat-label">Saved</div>
          </div>
        </section>

        {/* Level Progress */}
        <section className="level-card" aria-label="Level progress">
          <div className="level-header">
            <span className="level-name">Level {level.level} — {level.name}</span>
            <span className="level-pts">
              {user.points} pts
              {nextLevel && ` · ${nextLevel.minPoints - user.points} to ${nextLevel.name}`}
            </span>
          </div>
          <div className="level-bar-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="level-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </section>

        {/* Daily Check-in */}
        <section aria-label="Daily check-in">
          <button
            id="daily-checkin-btn"
            className={`checkin-btn ${alreadyCheckedIn ? 'checkin-done' : ''}`}
            onClick={handleCheckin}
            disabled={alreadyCheckedIn || checkinLoading}
            aria-label={alreadyCheckedIn ? 'Already checked in today' : 'Check in for today'}
          >
            {checkinLoading ? (
              '⏳ Checking in...'
            ) : alreadyCheckedIn ? (
              '✅ Checked in today!'
            ) : (
              '🎯 Daily Check-in — +50 pts'
            )}
          </button>
        </section>

        {/* SOS Button */}
        <section aria-label="Craving help">
          <Link href="/sos" id="sos-button-link" style={{ textDecoration: 'none', display: 'block' }}>
            <button className="sos-btn" type="button">
              <span>🆘 Craving SOS</span>
              <span className="sos-btn-sub">Get a 5-min distraction · +10 pts</span>
            </button>
          </Link>
        </section>

        {/* Badges */}
        <section aria-label="Badges">
          <h2 className="section-title">🏅 Your Badges</h2>
          <div className="badges-grid">
            {badges.map(badge => (
              <div
                key={badge.id}
                className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}
                title={badge.description}
                aria-label={`${badge.name}: ${badge.description}${badge.unlocked ? ' (unlocked)' : ' (locked)'}`}
              >
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <span className="nav-item active" aria-current="page">
          <span className="nav-icon">🏠</span>
          Home
        </span>
        <Link href="/leaderboard" className="nav-item" id="nav-leaderboard">
          <span className="nav-icon">🏆</span>
          Leaderboard
        </Link>
        <button
          className="nav-item"
          id="nav-logout"
          onClick={() => {
            if (confirm('Log out? You can log back in anytime with your username and password.')) {
              localStorage.removeItem('breakfree_userId');
              router.push('/login');
            }
          }}
        >
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </nav>
    </>
  );
}
