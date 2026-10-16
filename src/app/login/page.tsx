'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim()) return setError('Please enter your username.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('breakfree_userId', data.user._id);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboarding-page page-enter">
      <div className="onboarding-hero">
        <span className="onboarding-emoji">🌿</span>
        <h1 className="onboarding-title">Welcome Back</h1>
        <p className="onboarding-sub">
          Log in to continue your streak and see your progress.
        </p>
      </div>

      <form onSubmit={handleLogin} autoComplete="on">
        {/* Username */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">Username</label>
          <input
            id="login-username"
            className="form-input"
            type="text"
            placeholder="your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              className="form-input"
              type={showPass ? 'text' : 'password'}
              placeholder="your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
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

        {/* Error */}
        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
            ⚠️ {error}
          </p>
        )}

        <button
          id="login-submit-btn"
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? '⏳ Logging in...' : '🔓 Log In'}
        </button>
      </form>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        margin: '24px 0', color: 'var(--text-light)', fontSize: 13
      }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        New here?
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <Link href="/onboarding" style={{ textDecoration: 'none', display: 'block' }}>
        <button
          id="goto-register-btn"
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
          🚀 Create an Account
        </button>
      </Link>
    </div>
  );
}
