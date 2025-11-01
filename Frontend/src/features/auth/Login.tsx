import React, { FormEvent, useMemo, useState } from "react";
import {
  GoogleLoginButton,
  AppleLoginButton,
  XLoginButton,
  FacebookLoginButton,
} from "react-social-login-buttons";
import { BrandMark } from "@/shared/ui/brand";
import { Link } from "react-router-dom";

const providers = [
  { key: "google", label: "Google", Button: GoogleLoginButton },
  { key: "apple", label: "Apple", Button: AppleLoginButton },
  { key: "x", label: "X", Button: XLoginButton },
  { key: "facebook", label: "Facebook", Button: FacebookLoginButton },
] as const;

type ProviderKey = (typeof providers)[number]["key"];

type ProviderComponents = Record<ProviderKey, React.ComponentType<any>>;

const socialButtonClassName =
  "!rounded-2xl !shadow-sm !px-4 !py-3 !text-base !font-medium !transition-all focus-visible:!ring-2 focus-visible:!ring-offset-2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const providerButtons = useMemo<ProviderComponents>(() => {
    return providers.reduce((acc, provider) => {
      acc[provider.key] = provider.Button;
      return acc;
    }, {} as ProviderComponents);
  }, []);

  const handleLogin = (provider: ProviderKey | "local") => {
    console.info(`login:start`, { provider });
    window.location.href = `/api/auth/${provider}`;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password || submitting) {
      return;
    }
    setSubmitting(true);
    console.info("login:form", { email });
    handleLogin("local");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-16 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.1),_transparent_55%)]" aria-hidden />
      <div className="relative w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/70 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl transition dark:border-slate-800/60 dark:bg-slate-900/60">
          <section className="hidden min-h-full flex-col justify-between bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 p-12 text-indigo-50 md:flex">
            <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.35em] text-indigo-100/80">
              <div className="h-2 w-2 rounded-full bg-white/70" />
              Nexus Intelligence
            </div>
            <div className="space-y-6">
              <BrandMark className="h-8 text-white" />
              <h1 className="text-4xl font-semibold leading-tight">
                Effortless access to a world-class AI workspace.
              </h1>
              <p className="text-base text-indigo-100/80">
                Sign in once and pick up your projects, chats, and automation threads from any device. Nexus keeps your
                context safe while staying beautifully simple.
              </p>
            </div>
            <div className="space-y-4 text-sm text-indigo-100/70">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Highlights
                </span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-[3px] text-lg">✨</span>
                  <span>
                    <strong className="font-semibold">Adaptive security</strong> with anomaly detection keeps every session
                    safeguarded.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-[3px] text-lg">💫</span>
                  <span>
                    <strong className="font-semibold">Unified memory</strong> syncs your chats and assets instantly across
                    teams.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span aria-hidden className="mt-[3px] text-lg">🚀</span>
                  <span>
                    <strong className="font-semibold">Enterprise-ready</strong> controls help you scale with compliance and
                    care.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col justify-center bg-white/90 p-8 backdrop-blur-xl md:p-12 dark:bg-slate-950/80">
            <div className="mb-8 flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <BrandMark className="h-7" />
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Sign in to Nexus</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Continue with a trusted provider or use your workspace credentials.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {providers.map(({ key, label }) => {
                const ButtonComponent = providerButtons[key];
                return (
                  <ButtonComponent
                    key={key}
                    className={`${socialButtonClassName} dark:!bg-slate-800 dark:!text-slate-100`}
                    onClick={() => handleLogin(key)}
                    aria-label={`Continue with ${label}`}
                  />
                );
              })}
            </div>

            <div className="my-8 flex items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="uppercase tracking-[0.3em]">or</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="login-email">
                  Work email
                </label>
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@nexus.ai"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(148,163,184,0.2)] transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(148,163,184,0.2)] transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-50 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(79,70,229,0.6)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
                disabled={!email || !password || submitting}
              >
                {submitting ? "Signing in…" : "Continue"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-500">
              <div className="flex flex-wrap justify-between gap-2">
                <Link to="/reset" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                  Forgot password?
                </Link>
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                  Create an account
                </Link>
              </div>
              <p className="text-center leading-relaxed text-slate-400 dark:text-slate-500">
                By continuing you agree to the Nexus.ai
                <a className="ml-1 underline decoration-indigo-300/70 decoration-2 underline-offset-4 hover:decoration-indigo-500" href="/terms">
                  Terms of Use
                </a>
                <span className="mx-1">and</span>
                <a className="underline decoration-indigo-300/70 decoration-2 underline-offset-4 hover:decoration-indigo-500" href="/privacy">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
