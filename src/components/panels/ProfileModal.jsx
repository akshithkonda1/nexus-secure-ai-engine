import React, { useEffect, useRef, useState } from "react";

const settings = [
  {
    key: "account",
    label: "Account",
    description: "Profile, billing, connected identities",
    icon: (
      <svg
        className="h-5 w-5 text-indigo-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
        <path d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6" />
      </svg>
    ),
  },
  {
    key: "security",
    label: "Security",
    description: "MFA, device approvals, activity",
    icon: (
      <svg
        className="h-5 w-5 text-emerald-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 5 6v6c0 3.866 2.686 7 7 7s7-3.134 7-7V6l-7-3z" />
        <path d="M9.5 12.5 11 14l3.5-3.5" />
      </svg>
    ),
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Signal, mentions, escalations",
    icon: (
      <svg
        className="h-5 w-5 text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15V11a6 6 0 10-12 0v4l-1.5 2h15z" />
        <path d="M9.5 19a2.5 2.5 0 005 0" />
      </svg>
    ),
  },
  {
    key: "appearance",
    label: "Appearance",
    description: "Theme, glass, dock behavior",
    icon: (
      <svg
        className="h-5 w-5 text-sky-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="m4.93 4.93 2.83 2.83" />
        <path d="m16.24 16.24 2.83 2.83" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="m4.93 19.07 2.83-2.83" />
        <path d="m16.24 7.76 2.83-2.83" />
      </svg>
    ),
  },
];

const ProfileModal = ({ onClose, anchorRef }) => {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleOverlayClick = (event) => {
    if (cardRef.current && !cardRef.current.contains(event.target)) {
      const anchorEl = anchorRef?.current;
      if (!anchorEl || !anchorEl.contains(event.target)) {
        onClose?.();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50" onMouseDown={handleOverlayClick}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="absolute right-4 top-20 w-full max-w-[420px] px-4 sm:right-6 sm:px-0">
        <div
          ref={cardRef}
          className={`overflow-hidden rounded-[24px] border border-[var(--border-card)] bg-[var(--bg-card)]/70 text-[var(--text-primary)] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-[var(--glass-blur)] transition duration-200 ease-out ${
            visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/4 to-transparent" />
            <div className="flex items-center gap-4 px-6 pb-5 pt-6">
              <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 shadow-[0_12px_45px_rgba(99,102,241,0.45)]">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryuzen"
                  alt="Profile avatar"
                  className="h-full w-full rounded-full border-2 border-white/20 object-cover"
                />
                <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-base font-semibold leading-tight">
                  Aiden Kato
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">aiden@ryuzen.os</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Ryuzen
              </div>
            </div>
          </div>

          <div className="space-y-1 px-2 pb-4 pt-1">
            {settings.map((item) => (
              <button
                key={item.key}
                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--text-primary)] shadow-inner shadow-white/5">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{item.description}</div>
                </div>
                <svg
                  className="h-4 w-4 text-[var(--text-secondary)] transition group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-4 py-4 backdrop-blur-sm">
            <button className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4v4" />
                <path d="M10 14 19 5" />
                <path d="M19 13v6H5V5h6" />
              </svg>
              Sign Out
            </button>
            <span className="text-xs font-medium text-[var(--text-secondary)]">Version 2.8.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
