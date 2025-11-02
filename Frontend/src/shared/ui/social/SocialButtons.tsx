import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import "./social-buttons.css";

type ProviderKey = "google" | "apple" | "x" | "facebook";

interface ProviderConfig {
  key: ProviderKey;
  label: string;
  helper: string;
  href: string;
  icon: ReactNode;
  className: string;
}

export interface SocialButtonsProps {
  className?: string;
  hrefs?: Partial<Record<ProviderKey, string>>;
  onProviderClick?: (provider: ProviderKey) => void;
}

const PROVIDER_ICONS: Record<ProviderKey, ReactNode> = {
  google: (
    <svg aria-hidden className="size-4" viewBox="0 0 24 24" role="img">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.75h3.54c2.07-1.91 3.3-4.72 3.3-8.08Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.54-2.75c-.98.66-2.25 1.06-3.74 1.06-2.87 0-5.3-1.94-6.17-4.55H2.18v2.86A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC04"
        d="M5.83 14.09A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.35-2.09V7.05H2.18A10.99 10.99 0 0 0 1 12c0 1.78.42 3.46 1.18 4.95l3.65-2.86Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.2 1.66l3.14-3.14C17.45 1.33 14.97 0 12 0 7.31 0 3.28 2.69 1.18 6.64l3.65 2.86C5.7 7.89 8.13 5.38 12 5.38Z"
      />
    </svg>
  ),
  apple: (
    <svg aria-hidden className="size-4" viewBox="0 0 24 24" role="img">
      <path
        fill="currentColor"
        d="M17.47 12.64c-.02-2.24 1.83-3.32 1.91-3.37-1.05-1.53-2.68-1.73-3.26-1.75-1.39-.14-2.71.82-3.41.82-.71 0-1.8-.8-2.95-.78-1.51.02-2.92.88-3.7 2.23-1.58 2.72-.4 6.74 1.13 8.95.75 1.08 1.64 2.3 2.81 2.26 1.13-.05 1.55-.73 2.91-.73 1.36 0 1.73.73 2.95.71 1.22-.02 1.99-1.1 2.73-2.19.86-1.25 1.21-2.46 1.23-2.52-.03-.01-2.34-.9-2.36-3.63Z"
      />
      <path
        fill="currentColor"
        d="M15.5 5.49c.61-.74 1.03-1.76.92-2.79-.89.04-1.96.6-2.6 1.34-.57.66-1.07 1.72-.94 2.72.99.08 2-.5 2.62-1.27Z"
      />
    </svg>
  ),
  x: (
    <svg aria-hidden className="size-4" viewBox="0 0 24 24" role="img">
      <path
        fill="currentColor"
        d="M18.36 2h3.32l-7.26 8.29L23 22h-6.52l-4.09-6.37L7.63 22H4.3l7.61-8.69L1 2h6.7l3.7 5.8L18.36 2Zm-1.14 18.01h1.84L6.86 3.86H4.9l12.32 16.15Z"
      />
    </svg>
  ),
  facebook: (
    <svg aria-hidden className="size-4" viewBox="0 0 24 24" role="img">
      <path
        fill="currentColor"
        d="M13.5 22v-8.34h2.8l.42-3.25h-3.22V8.33c0-.94.26-1.58 1.62-1.58h1.73V3.88A23.64 23.64 0 0 0 14.34 3c-2.5 0-4.22 1.53-4.22 4.35v2.44H7.3v3.25h2.82V22h3.38Z"
      />
    </svg>
  ),
};

const PROVIDERS: ProviderConfig[] = [
  {
    key: "google",
    label: "Continue with Google",
    helper: "Use your Google identity",
    href: "/api/auth/google",
    icon: PROVIDER_ICONS.google,
    className: "social-button social-button--google",
  },
  {
    key: "apple",
    label: "Continue with Apple",
    helper: "Secure sign in with Apple",
    href: "/api/auth/apple",
    icon: PROVIDER_ICONS.apple,
    className: "social-button social-button--apple",
  },
  {
    key: "x",
    label: "Continue with X",
    helper: "Bring your audience with you",
    href: "/api/auth/x",
    icon: PROVIDER_ICONS.x,
    className: "social-button social-button--x",
  },
  {
    key: "facebook",
    label: "Continue with Facebook",
    helper: "Collaborate with your community",
    href: "/api/auth/facebook",
    icon: PROVIDER_ICONS.facebook,
    className: "social-button social-button--facebook",
  },
];

export function SocialButtons({ className, hrefs, onProviderClick }: SocialButtonsProps) {
  return (
    <div className={cn("social-buttons", className)}>
      {PROVIDERS.map(({ key, label, helper, href, icon, className: buttonClass }) => {
        const resolvedHref = hrefs?.[key] ?? href;
        return (
          <button
            key={key}
            type="button"
            className={buttonClass}
            onClick={() => {
              onProviderClick?.(key);
              window.location.href = resolvedHref;
            }}
          >
            <span className="social-button__icon" aria-hidden>
              {icon}
            </span>
            <span className="social-button__label">
              {label}
              <span>{helper}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
