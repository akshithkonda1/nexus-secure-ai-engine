import React from "react";
import { Mail, Shield, User } from "lucide-react";

const ProfilePanel: React.FC = () => {
  return (
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
        <User className="h-4 w-4" /> Profile
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/40 via-sky-400/30 to-purple-400/35 shadow-lg shadow-cyan-500/25" />
        <div>
          <p className="text-lg font-semibold text-black dark:text-white">Ryuzen Operator</p>
          <p className="text-sm text-black/60 dark:text-white/70">ID: RZ-0412-OS</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-black/80 dark:text-white/80">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <Mail className="h-4 w-4 text-black/60 dark:text-white/60" />
          operator@ryuzen.ai
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <Shield className="h-4 w-4 text-black/60 dark:text-white/60" />
          Security status: MFA active
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
