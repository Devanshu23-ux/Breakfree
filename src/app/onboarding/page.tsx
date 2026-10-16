'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const HABITS = [
  { id: 'smoking', icon: '🚬', label: 'Smoking' },
  { id: 'alcohol', icon: '🍺', label: 'Alcohol' },
  { id: 'custom',  icon: '⚡', label: 'Custom'  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [habit, setHabit] = useState('');
  const [customHabit, setCustomHabit] = useState('');
  const [quitDate, setQuitDate] = useState('');
  const [costPerDay, setCostPerDay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localNow, setLocalNow] = useState('');

  useEffect(() => {
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setLocalNow(now);
    setQuitDate(now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!username.trim()) return setError('Please choose a username.');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim()))
      return setError('Username: 3–20 characters, letters/numbers/underscore only.');
    if (!password) return setError('Please set a password.');
    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (!habit) return setError('Please choose what you want to quit.');
    if (habit === 'custom' && !customHabit.trim()) return setError('Please name your habit.');
    if (!quitDate) return setError('Please enter your quit date and time.');

    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
          habit,
          customHabit: customHabit.trim() || undefined,
          quitStartTime: new Date(quitDate).toISOString(),
          moneySavedPerDay: parseFloat(costPerDay) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');
      localStorage.setItem('breakfree_userId', data.user._id);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-page page-enter">
      <div className="onboarding-hero">
        <span className="onboarding-emoji">🌿</span>
        <h1 className="onboarding-title">Create Account</h1>
        <p className="onboarding-sub">
          Set up your profile once — log in from any device with your username and password.
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="on">
        {/* Display Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name-input">Display Name</label>
          <input
            id="name-input"
            className="form-input"
            type="text"
            placeholder="e.g. Devanshu"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            autoComplete="name"
          />
        </div>

        {/* Username */}
        <div className="form-group">
          <label className="form-label" htmlFor="username-input">Username</label>
          <input
            id="username-input"
            className="form-input"
            type="text"
            placeholder="e.g. devanshu99"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            maxLength={20}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 5 }}>
            3–20 chars · letters, numbers, underscore
          </p>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password-input">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password-input"
              className="form-input"
              type={showPass ? 'text' : 'password'}
              placeholder="At least 4 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 18, color: 'var(--text-light)',
              }}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Habit Selector */}
        <div className="form-group">
          <label className="form-label">What are you quitting?</label>
          <div className="habit-options">
            {HABITS.map(h => (
              <button
                key={h.id}
                type="button"
                id={`habit-${h.id}`}
                className={`habit-option ${habit === h.id ? 'selected' : ''}`}
                onClick={() => setHabit(h.id)}
              >
                <span className="habit-option-icon">{h.icon}</span>
                <span className="habit-option-label">{h.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom habit name */}
        {habit === 'custom' && (
          <div className="form-group">
            <label className="form-label" htmlFor="custom-habit-input">Name your habit</label>
            <input
              id="custom-habit-input"
              className="form-input"
              type="text"
              placeholder="e.g. Junk food, Social media..."
              value={customHabit}
              onChange={e => setCustomHabit(e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        {/* Quit date/time */}
        <div className="form-group">
          <label className="form-label" htmlFor="quit-date-input">When did you quit?</label>
          <input
            id="quit-date-input"
            className="form-input"
            type="datetime-local"
            value={quitDate}
            onChange={e => setQuitDate(e.target.value)}
            max={localNow}
          />
        </div>

        {/* Daily cost */}
        <div className="form-group">
          <label className="form-label" htmlFor="cost-input">Daily cost (₹) — optional</label>
          <input
            id="cost-input"
            className="form-input"
            type="number"
            placeholder="e.g. 100"
            value={costPerDay}
            onChange={e => setCostPerDay(e.target.value)}
            min="0"
            step="1"
          />
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>
            We&apos;ll show how much money you&apos;ve saved
          </p>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
            ⚠️ {error}
          </p>
        )}

        <button
          id="start-journey-btn"
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating account...' : '🚀 Start My Journey'}
        </button>
      </form>

      {/* Already have account */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        margin: '24px 0', color: 'var(--text-light)', fontSize: 13,
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        Already have an account?
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <Link href="/login" style={{ textDecoration: 'none', display: 'block' }}>
        <button
          id="goto-login-btn"
          type="button"
          style={{
            width: '100%', padding: '16px',
            background: 'var(--teal-light)',
            color: 'var(--teal-dark)',
            border: '2px solid var(--teal)',
            borderRadius: 'var(--radius-md)',
            fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font)', cursor: 'pointer',
          }}
        >
          🔓 Log In Instead
        </button>
      </Link>
    </div>
  );
}
