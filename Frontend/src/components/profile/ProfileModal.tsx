import { Bell, ChevronRight, LogOut, Palette, Settings, Shield, User } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end items-start pr-6 pt-20"
      onClick={onClose}
    >
      <div className="absolute inset-0" />

      <div
        className="
          relative z-50 w-80 rounded-2xl p-6 
          bg-[var(--bg-card)] border border-[var(--border-card)]
          backdrop-blur-[var(--glass-blur)]
          shadow-[0_8px_40px_rgba(0,0,0,0.4)]
          animate-in fade-in zoom-in
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 
                          flex items-center justify-center overflow-hidden">
            <User size={32} className="text-[var(--text-primary)] opacity-80" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
            Akshith Konda
          </h2>
          <p className="text-sm text-[var(--text-secondary)] opacity-80">
            akkikonda2000@gmail.com
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-[var(--text-secondary)]">Online</span>
          </div>
        </div>

        <div className="space-y-2">
          <MenuItem icon={<Settings size={18} />} label="Manage Account" />
          <MenuItem icon={<Shield size={18} />} label="Security & Privacy" />
          <MenuItem icon={<Bell size={18} />} label="Notifications" />
          <MenuItem icon={<Palette size={18} />} label="Theme & Appearance" />
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-card)] flex flex-col gap-3">
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition">
            <LogOut size={18} /> Sign Out
          </button>

          <p className="text-xs text-[var(--text-secondary)] opacity-50 text-center">
            Ryuzen OS v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: JSX.Element; label: string }) {
  return (
    <button
      className="
        w-full flex items-center justify-between px-2 py-2.5 rounded-xl
        text-[var(--text-primary)] hover:bg-white/10 dark:hover:bg-white/5
        transition
      "
    >
      <div className="flex items-center gap-3 opacity-90">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <ChevronRight size={18} className="opacity-60" />
    </button>
  );
}
