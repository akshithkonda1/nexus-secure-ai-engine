import React, { useRef, useState } from "react";
import ProfileModal from "../panels/ProfileModal";

const ProfileButton = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)]/80 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_15px_45px_rgba(0,0,0,0.35)] backdrop-blur-[var(--glass-blur)] transition hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-base font-bold text-white shadow-[0_8px_30px_rgba(79,70,229,0.55)]">
          <span>RZ</span>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[var(--bg-card)] bg-emerald-400 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]" />
        </span>
        <div className="hidden text-left sm:block">
          <div className="text-sm leading-tight">Aiden Kato</div>
          <div className="text-xs font-normal text-[var(--text-secondary)]">aiden@ryuzen.os</div>
        </div>
        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180 text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && <ProfileModal anchorRef={buttonRef} onClose={() => setOpen(false)} />}
    </div>
  );
};

export default ProfileButton;
