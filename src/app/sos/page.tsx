'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SOS_ACTIVITIES } from '@/lib/gameLogic';
import { ISOSActivity } from '@/types';

export default function SOSPage() {
  const router = useRouter();
  const [activity, setActivity] = useState<ISOSActivity | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    // Pick a random activity on mount
    const random = SOS_ACTIVITIES[Math.floor(Math.random() * SOS_ACTIVITIES.length)];
    setActivity(random);
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  async function handleComplete() {
    if (completed || loading) return;
    setLoading(true);
    const userId = localStorage.getItem('breakfree_userId');

    if (userId) {
      try {
        await fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch {
        // Non-critical — still mark as completed
      }
    }

    setCompleted(true);
    setLoading(false);
    showToast('💪 Great job! +10 pts earned!');
    setTimeout(() => router.push('/'), 2000);
  }

  function handleNewActivity() {
    const others = SOS_ACTIVITIES.filter(a => a.id !== activity?.id);
    const random = others[Math.floor(Math.random() * others.length)];
    setActivity(random);
    setCompleted(false);
  }

  if (!activity) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-text">Finding the right activity...</p>
    </div>
  );

  return (
    <>
      <div className={`toast success ${toast.show ? 'show' : ''}`} role="alert">{toast.message}</div>

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🌿</span>
          <span className="app-logo-text">BreakFree</span>
        </div>
        <button
          id="sos-back-btn"
          className="back-btn"
          onClick={() => router.push('/')}
          aria-label="Go back to home"
        >
          ← Back
        </button>
      </header>

      <main className="sos-page page-enter">
        <div style={{ marginBottom: 8 }}>
          <h1 className="section-title" style={{ fontSize: 20 }}>🆘 Craving SOS</h1>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
            You&apos;ve got this. Try this 5-minute activity and earn +10 pts.
          </p>
        </div>

        {/* Activity Card */}
        <div className="sos-activity-card" role="region" aria-label={`Activity: ${activity.title}`}>
          <span className="sos-emoji">{activity.emoji}</span>
          <h2 className="sos-activity-title">{activity.title}</h2>
          <p className="sos-activity-desc">{activity.description}</p>
          <span className="sos-duration">⏱ {activity.duration}</span>
        </div>

        {/* Steps */}
        <div className="sos-steps-card">
          <p className="sos-steps-title">How to do it</p>
          {activity.steps.map((step, i) => (
            <div className="sos-step" key={i}>
              <span className="sos-step-num">{i + 1}</span>
              <span className="sos-step-text">{step}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          id="sos-complete-btn"
          className="sos-complete-btn"
          onClick={handleComplete}
          disabled={completed || loading}
          aria-label="Mark activity as done and earn 10 points"
        >
          {loading ? '⏳ Saving...' : completed ? '✅ Done! Heading back...' : '✅ I Did It! +10 pts'}
        </button>

        <button
          id="sos-try-another-btn"
          className="sos-skip-btn"
          onClick={handleNewActivity}
          disabled={loading || completed}
          aria-label="Try a different activity"
        >
          Try a different activity
        </button>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <button className="nav-item" onClick={() => router.push('/')} id="sos-nav-home">
          <span className="nav-icon">🏠</span>
          Home
        </button>
        <button className="nav-item" onClick={() => router.push('/leaderboard')} id="sos-nav-lb">
          <span className="nav-icon">🏆</span>
          Leaderboard
        </button>
        <span className="nav-item active" aria-current="page">
          <span className="nav-icon">🆘</span>
          SOS
        </span>
      </nav>
    </>
  );
}
