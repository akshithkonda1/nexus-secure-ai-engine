import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn, bg, text, border } from '../../utils/theme';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/toron');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    setError('');
    setLoading(true);

    try {
      await loginWithProvider(provider);
      navigate('/toron');
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-app)] px-4">
      <div className="w-full max-w-md">
        {/* Orb Background Effect */}
        <div className="relative">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent blur-3xl"
            aria-hidden="true"
          />

          {/* Login Card */}
          <div
            className={cn(
              'relative rounded-3xl border-2 p-10 shadow-2xl backdrop-blur-sm',
              bg.surface,
              border.subtle
            )}
          >
            {/* Header */}
            <div className="mb-10 text-center">
              <h1 className={cn('mb-3 text-4xl font-bold tracking-tight', text.primary)}>
                Welcome back
              </h1>
              <p className={cn('text-base', text.muted)}>
                Sign in to your Ryuzen account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm font-medium text-red-500 backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="mb-8 space-y-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className={cn(
                  'group flex w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)]'
                )}
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className={cn(
                  'group flex w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)]'
                )}
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('microsoft')}
                disabled={loading}
                className={cn(
                  'group flex w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)]'
                )}
              >
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#00a4ef" d="M1 13h10v10H1z" />
                  <path fill="#7fba00" d="M13 1h10v10H13z" />
                  <path fill="#ffb900" d="M13 13h10v10H13z" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className={cn('w-full border-t-2', border.subtle)} />
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className={cn('px-4', bg.surface, text.muted)}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={cn('mb-2 block text-sm font-semibold', text.primary)}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  disabled={loading}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50',
                    bg.elevated,
                    border.subtle,
                    text.primary,
                    'placeholder:text-[var(--text-muted)] placeholder:font-normal'
                  )}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className={cn('block text-sm font-semibold', text.primary)}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50',
                    bg.elevated,
                    border.subtle,
                    text.primary,
                    'placeholder:text-[var(--text-muted)] placeholder:font-normal'
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
                  bg.accent,
                  text.inverse
                )}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className={cn('text-sm font-medium', text.muted)}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-[var(--accent)] transition-colors hover:text-[var(--accent)]/80"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <div className={cn('flex items-center gap-2 rounded-full border-2 px-4 py-2', border.subtle)}>
                <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className={cn('text-xs font-semibold', text.muted)}>
                  Secure
                </span>
              </div>
              <div className={cn('flex items-center gap-2 rounded-full border-2 px-4 py-2', border.subtle)}>
                <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={cn('text-xs font-semibold', text.muted)}>
                  Encrypted
                </span>
              </div>
              <div className={cn('flex items-center gap-2 rounded-full border-2 px-4 py-2', border.subtle)}>
                <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className={cn('text-xs font-semibold', text.muted)}>
                  Fast
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
