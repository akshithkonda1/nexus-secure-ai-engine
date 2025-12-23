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

  const handleOAuthLogin = async (provider: 'google' | 'apple' | 'facebook' | 'microsoft') => {
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
              'relative rounded-2xl border p-8 shadow-xl backdrop-blur-sm',
              bg.surface,
              border.subtle
            )}
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className={cn('mb-2 text-3xl font-bold', text.primary)}>
                Welcome back
              </h1>
              <p className={cn('text-sm', text.muted)}>
                Sign in to your Ryuzen account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--line-strong)]'
                )}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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

              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                disabled={loading}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--line-strong)]'
                )}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                disabled={loading}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--line-strong)]'
                )}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('microsoft')}
                disabled={loading}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                  bg.elevated,
                  border.subtle,
                  text.primary,
                  'hover:border-[var(--line-strong)]'
                )}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#00a4ef" d="M1 13h10v10H1z" />
                  <path fill="#7fba00" d="M13 1h10v10H13z" />
                  <path fill="#ffb900" d="M13 13h10v10H13z" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className={cn('w-full border-t', border.subtle)} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={cn('px-2', bg.surface, text.muted)}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={cn('mb-1.5 block text-sm font-medium', text.primary)}>
                  Email
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
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50',
                    bg.elevated,
                    border.subtle,
                    text.primary,
                    'placeholder:text-[var(--text-muted)]'
                  )}
                />
              </div>

              <div>
                <label htmlFor="password" className={cn('mb-1.5 block text-sm font-medium', text.primary)}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50',
                    bg.elevated,
                    border.subtle,
                    text.primary,
                    'placeholder:text-[var(--text-muted)]'
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50',
                  bg.accent,
                  text.inverse
                )}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className={cn('text-sm', text.muted)}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Badges */}
            <div className="mt-6 flex justify-center gap-2">
              <span className={cn('rounded-full border px-3 py-1 text-xs', border.subtle, text.muted)}>
                Secure Authentication
              </span>
              <span className={cn('rounded-full border px-3 py-1 text-xs', border.subtle, text.muted)}>
                Privacy First
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
