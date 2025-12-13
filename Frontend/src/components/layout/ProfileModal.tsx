import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mail, Paintbrush2, ShieldCheck, User, Wand2 } from "lucide-react";

const userProfile = {
  name: "Ryuzen Operator",
  id: "user-2049",
  plan: "Nebula Pro",
  email: "operator@ryuzen.io",
  isOAuth: false,
};

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/30 px-4 pt-[88px] sm:pt-[96px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] shadow-[0_26px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-label="Profile"
          >
            <div className="relative overflow-hidden px-5 pb-5 pt-6">
              <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,93,255,0.25),transparent_60%)] blur-3xl" aria-hidden />
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(72,217,168,0.24),transparent_60%)] blur-3xl" aria-hidden />
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Profile</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent-secondary)_22%,transparent)] text-lg font-semibold text-[var(--text-primary)] shadow-inner shadow-black/30">
                  {userProfile.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{userProfile.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{userProfile.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Plan: {userProfile.plan}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-4">
              <ProfileAction icon={<User className="h-4 w-4" />} label="Account" description="Manage credentials and identity" />
              <ProfileAction icon={<ShieldCheck className="h-4 w-4" />} label="Security" description="MFA, device trust, and audit" />
              <ProfileAction icon={<Paintbrush2 className="h-4 w-4" />} label="Preferences" description="Shortcuts, theme, focus" />
              <ProfileAction
                icon={<Wand2 className="h-4 w-4" />}
                label="Personalization"
                description="Profile photo and signature"
              />
              {!userProfile.isOAuth && (
                <ProfileAction icon={<Mail className="h-4 w-4" />} label="Notifications" description="Delivery and routing" />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)] px-5 py-4">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Session</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">ID: {userProfile.id}</p>
              </div>
              <button className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">
                Manage devices
              </button>
            </div>

            <button
              className="flex w-full items-center gap-2 bg-[color-mix(in_srgb,var(--panel-strong)_96%,transparent)] px-5 py-4 text-left text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[color-mix(in_srgb,var(--accent-secondary)_16%,transparent)]"
              onClick={onClose}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProfileAction({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <button className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left text-sm text-[var(--text-primary)] transition hover:border-[var(--border-soft)] hover:bg-[color-mix(in_srgb,var(--accent-secondary)_8%,transparent)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent-secondary)_14%,transparent)] text-[var(--text-primary)] shadow-inner shadow-black/20">
        {icon}
      </span>
      <div className="flex-1 leading-tight">
        <p className="font-semibold leading-tight">{label}</p>
        <p className="text-xs text-[var(--text-secondary)]">{description}</p>
      </div>
    </button>
  );
}

export default ProfileModal;
