import React from "react";
import { ShieldCheck, User } from "lucide-react";

const ProfilePanel: React.FC = () => {
  return (
    <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <User className="h-4 w-4" /> Profile
      </div>
      <p className="mt-3 text-sm text-white/70">Your LiquidOS bubble. Update presence, security, and identity.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">Presence</div>
          <p className="mt-2 text-lg font-semibold text-white">Online • Studio Mode</p>
          <p className="text-sm text-white/60">Broadcasting availability to Toron and Workspace canvases.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
            <ShieldCheck className="h-4 w-4" /> Security
          </div>
          <p className="mt-2 text-sm text-white/70">Encryption active. Telemetry opt-in disabled.</p>
          <button className="mt-3 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20">
            Manage keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
