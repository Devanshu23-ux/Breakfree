'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ILeaderboardEntry } from '@/types';

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ILeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('breakfree_userId'));
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const data = await res.json();
        setEntries(data.leaderboard);
      } catch {
        setError('Could not load leaderboard. Check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const rankClass = (rank: number) =>
    rank === 1 ? 'top-1' : rank === 2 ? 'top-2' : rank === 3 ? 'top-3' : '';

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🌿</span>
          <span className="app-logo-text">BreakFree</span>
        </div>
        <button
          id="lb-back-btn"
          className="back-btn"
          onClick={() => router.push('/')}
          aria-label="Go back to home"
        >
          ← Back
        </button>
      </header>

      <main className="page-content page-enter">
        <h1 className="section-title" style={{ fontSize: 20, marginBottom: 4 }}>
          🏆 Leaderboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
          Top quitters this week — keep pushing!
        </p>

        {loading && (
          <div className="loading-screen">
            <div className="spinner" />
            <p className="loading-text">Loading leaderboard...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: 20, textAlign: 'center', color: '#dc2626',
            fontSize: 14
          }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No one here yet!</p>
            <p style={{ fontSize: 13 }}>Be the first to check in and claim the top spot.</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="leaderboard-list" role="list" aria-label="Leaderboard rankings">
            {entries.map(entry => (
              <div
                key={entry._id}
                role="listitem"
                className={`lb-row ${rankClass(entry.rank)} ${entry._id === currentUserId ? 'current-user' : ''}`}
                aria-label={`Rank ${entry.rank}: ${entry.name}, ${entry.points} points`}
              >
                <div className="lb-rank">
                  {RANK_MEDALS[entry.rank] ?? `#${entry.rank}`}
                </div>
                <div className="lb-info">
                  <div className="lb-name">
                    {entry.name}
                    {entry._id === currentUserId && (
                      <span style={{ fontSize: 11, color: 'var(--teal)', marginLeft: 6, fontWeight: 500 }}>
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="lb-habit">{entry.habit}</div>
                  <div className="lb-streak">🔥 {entry.streak} day streak</div>
                </div>
                <div className="lb-points">
                  <div className="lb-pts-num">{entry.points}</div>
                  <div className="lb-pts-label">pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <Link href="/" className="nav-item" id="lb-nav-home">
          <span className="nav-icon">🏠</span>
          Home
        </Link>
        <span className="nav-item active" aria-current="page">
          <span className="nav-icon">🏆</span>
          Leaderboard
        </span>
        <button
          className="nav-item"
          id="lb-nav-sos"
          onClick={() => router.push('/sos')}
        >
          <span className="nav-icon">🆘</span>
          SOS
        </button>
      </nav>
    </>
  );
}
