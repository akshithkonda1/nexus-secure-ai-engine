import { Download, Settings2 } from "lucide-react";
import React from "react";

const iconButtonStyles =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/30 text-slate-200 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-5 py-4 shadow-soft backdrop-blur-sm">
      <div className="text-lg font-semibold tracking-tight text-slate-100">Toron</div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Configuration" className={iconButtonStyles}>
          <Settings2 className="h-5 w-5" strokeWidth={1.7} />
        </button>
        <button type="button" aria-label="Export" className={iconButtonStyles}>
          <Download className="h-5 w-5" strokeWidth={1.7} />
        </button>
      </div>
    </header>
  );
}
