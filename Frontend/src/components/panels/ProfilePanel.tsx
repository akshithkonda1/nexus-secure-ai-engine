import React from "react";
import { Mail, Shield, User } from "lucide-react";

const ProfilePanel: React.FC = () => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <User className="h-4 w-4" /> Profile
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400/40 via-sky-400/30 to-purple-400/35 shadow-lg shadow-cyan-500/25" />
        <div>
          <p className="text-lg font-semibold">Ryuzen Operator</p>
          <p className="text-sm text-white/70">ID: RZ-0412-OS</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-white/80">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <Mail className="h-4 w-4 text-white/60" />
          operator@ryuzen.ai
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <Shield className="h-4 w-4 text-white/60" />
          Security status: MFA active
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
