import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useConfig } from "../context/ConfigContext";

function useClickAway<T extends HTMLElement>(onAway: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onAway]);
  return ref;
}

function Toggle({checked, onChange, label}: {checked: boolean; onChange: (v:boolean)=>void; label: string}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-zinc-300">{label}</span>
      <button
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={"h-6 w-11 rounded-full border border-zinc-700 relative " + (checked ? "bg-green-600" : "bg-zinc-800")}
      >
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform " + (checked ? "translate-x-6" : "translate-x-0.5")} />
      </button>
    </label>
  );
}

function Slider({value, onChange, label, id}:{value:number; onChange:(v:number)=>void; label:string; id:string}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-zinc-300">{label}</label>
        <span className="text-xs text-zinc-500">{value}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function Header() {
  const { cfg, setCfg } = useConfig();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"system"|"user"|"billing"|"feedback">("system");
  const ref = useClickAway<HTMLDivElement>(() => setOpen(false));

  return (
    <header className="w-full border-b border-zinc-800 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Home */}
        <Link to="/" className="flex items-center gap-2 group">
          {/* Hex icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               className="h-6 w-6 text-white transition-transform group-hover:scale-105" fill="currentColor">
            <path d="M12 2 2 7v10l10 5 10-5V7L12 2Zm0 2.18 7.82 3.91v7.82L12 19.82l-7.82-3.91V8.09L12 4.18Z"/>
          </svg>
          <span className="text-lg font-semibold">Nexus</span>
        </Link>

        {/* Right: Nav + Gear */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-300">
            <NavLink to="/chat" className={({isActive}) => isActive ? "text-white" : "hover:text-white"}>Chat</NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? "text-white" : "hover:text-white"}>Settings</NavLink>
          </nav>

          <div className="relative" ref={ref}>
            <button
              aria-label="System Settings"
              onClick={() => setOpen(v => !v)}
              className="rounded-xl border border-zinc-700 p-2 hover:bg-zinc-900"
              title="System Settings"
            >
              {/* Gear icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   className="h-5 w-5" fill="currentColor">
                <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm8.94 3.05-.97-.56a7.91 7.91 0 0 0-.36-1.02l.55-.95a.75.75 0 0 0-.25-1.02l-1.3-.75a.75.75 0 0 0-1.02.25l-.56.97c-.34-.14-.69-.26-1.05-.35l-.2-1.11A.75.75 0 0 0 14.07 5h-1.5a.75.75 0 0 0-.74.63l-.2 1.11c-.36.09-.71.21-1.05.35l-.56-.97a.75.75 0 0 0-1.02-.25l-1.3.75a.75.75 0 0 0-.25 1.02l.55.95c-.14.34-.26.69-.35 1.05l-1.11.2A.75.75 0 0 0 5 9.93v1.5c0 .37.27.69.63.74l1.11.2c.09.36.21.71.35 1.05l-.55.95a.75.75 0 0 0 .25 1.02l1.3.75c.35.2.8.08 1.02-.25l.56-.97c.34.14.69.26 1.05.35l.2 1.11c.05.36.37.63.74.63h1.5c.37 0 .69-.27.74-.63l.2-1.11c.36-.09.71-.21 1.05-.35l.56.97c.22.33.67.45 1.02.25l1.3-.75a.75.75 0 0 0 .25-1.02l-.55-.95c.14-.34.26-.69.35-1.05l1.11-.2c.36-.05.63-.38.63-.74v-1.5a.75.75 0 0 0-.63-.74Z"/>
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-2 w-[22rem] rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(["system","user","billing","feedback"] as const).map(t => (
                    <button key={t}
                      onClick={()=>setTab(t)}
                      data-active={tab===t}
                      className="tab-btn data-[active=true]:bg-zinc-800 capitalize">{t}</button>
                  ))}
                </div>

                {/* Panels */}
                <div className="space-y-4 text-sm">
                  {tab==="system" && (
                    <div className="space-y-3">
                      <Slider id="webPct" value={cfg.webSearchPercent} onChange={(v)=>setCfg("webSearchPercent", v)} label="% Web Search" />
                      <Slider id="aiPct" value={cfg.aiModelsPercent} onChange={(v)=>setCfg("aiModelsPercent", v)} label="% AI Models" />
                      <Toggle checked={cfg.useBothByDefault} onChange={(v)=>setCfg("useBothByDefault", v)} label="Use Both by Default" />
                      <Toggle checked={cfg.consensusBeforeWebPrime} onChange={(v)=>setCfg("consensusBeforeWebPrime", v)} label="Consensus Before Web Is Prime" />
                      <div>
                        <label className="block text-zinc-300">Preferred Model</label>
                        <select
                          value={cfg.preferredModel}
                          onChange={(e)=>setCfg("preferredModel", e.target.value)}
                          className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-200"
                        >
                          <option value="gpt-4o">gpt-4o</option>
                          <option value="claude-3-5">claude-3-5</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {tab==="user" && (
                    <div>
                      <label className="block text-zinc-400">Name</label>
                      <input
                        value={cfg.userName}
                        onChange={(e)=>setCfg("userName", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2"
                        placeholder="Your name"
                      />
                      <label className="mt-3 block text-zinc-400">Email</label>
                      <input
                        value={cfg.userEmail}
                        onChange={(e)=>setCfg("userEmail", e.target.value)}
                        className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2"
                        placeholder="you@example.com"
                      />
                      <label className="mt-3 block text-zinc-400">Profile Photo</label>
                      <input type="file" accept="image/*" className="w-full text-zinc-400" />
                      <div className="mt-4 flex items-center justify-between">
                        <button onClick={() => window.alert("Saved changes")}
                          className="rounded-xl bg-white px-3 py-2 text-black hover:opacity-90">Save Changes</button>
                        <button onClick={() => window.confirm("Delete account?") && window.alert("Account deletion queued")}
                          className="rounded-xl border border-red-700 px-3 py-2 text-red-400 hover:bg-red-950">Delete Account</button>
                      </div>
                    </div>
                  )}

                  {tab==="billing" && (
                    <div className="rounded-xl border border-zinc-800 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Current Plan</span>
                        <span className="rounded-lg bg-zinc-800 px-2 py-1 text-xs">Free</span>
                      </div>
                      <p className="mt-2 text-zinc-500">Upgrade tiers coming soon.</p>
                      <button onClick={() => window.alert("We’re working on these plans — enjoy Nexus freely for now.")}
                        className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-black hover:opacity-90">Upgrade Plan</button>
                    </div>
                  )}

                  {tab==="feedback" && (
                    <div>
                      <textarea rows={4} className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2" placeholder="Tell us what to improve…" />
                      <button onClick={() => window.alert("Thanks for the feedback.")}
                        className="mt-3 w-full rounded-xl bg-white px-3 py-2 text-black hover:opacity-90">Submit</button>
                    </div>
                  )}
                </div>

                <style>{`
                  .tab-btn { padding:.5rem .75rem; border-radius:.75rem; border:1px solid #27272a; color:#a1a1aa; }
                  .tab-btn:hover { color:#fff; }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
