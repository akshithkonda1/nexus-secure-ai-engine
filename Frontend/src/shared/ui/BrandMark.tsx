import { useEffect, useId, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface BrandMarkProps {
  className?: string;
  title?: string;
}

export function BrandMark({ className, title = "Nexus" }: BrandMarkProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false);
  const gradientId = useId();

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const updatePreference = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedTransparency(event.matches);
    };

    updatePreference(query);

    const listener = (event: MediaQueryListEvent) => updatePreference(event);

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", listener);
      return () => {
        query.removeEventListener("change", listener);
      };
    }

    if (typeof query.addListener === "function") {
      query.addListener(listener);
      return () => {
        query.removeListener(listener);
      };
    }

    return undefined;
  }, []);

  if (!mounted || prefersReducedTransparency) {
    return <img src="/assets/nexus-logo.png" alt="Nexus" className={className} width={96} height={24} />;
  }

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 96 24"
      width="96"
      height="24"
      className={cn("brand-mark", className)}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="5%" y1="0%" x2="95%" y2="100%">
          <stop offset="0%" className="brand-mark__gradient-start" />
          <stop offset="100%" className="brand-mark__gradient-end" />
        </linearGradient>
      </defs>
      <g fillRule="evenodd" clipRule="evenodd">
        <path
          className="brand-mark__shape"
          d="M3.4 3.5h6.88l8.26 12.6h.12V3.5h7.22v17.88h-6.86l-8.3-12.7h-.12v12.7H3.4V3.5Zm30.2 0H51c6.7 0 11.68 4.74 11.68 11.44 0 6.56-5.08 10.94-11.54 10.94H33.6V3.5Zm11.78 14.2c2.7 0 4.56-1.8 4.56-4.38 0-2.76-1.74-4.6-4.44-4.6h-4.62v8.98h4.5Z"
        />
        <circle className="brand-mark__spark" cx="81.5" cy="12" r="10" />
        <path
          d="M81.5 3.5c4.7 0 8.5 3.8 8.5 8.5s-3.8 8.5-8.5 8.5S73 16.7 73 12s3.8-8.5 8.5-8.5Zm0 4.32a4.18 4.18 0 1 0 0 8.36 4.18 4.18 0 0 0 0-8.36Z"
          fill={`url(#${gradientId})`}
        />
      </g>
    </svg>
  );
}
