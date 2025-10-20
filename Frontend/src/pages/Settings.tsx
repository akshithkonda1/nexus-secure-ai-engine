import { useConfig } from "../context/ConfigContext";

export default function Settings() {
  const { cfg, reset } = useConfig();
  return (
    <div className="space-y-3 text-zinc-300">
      <h2 className="text-xl font-semibold">Settings</h2>
      <p className="text-zinc-400">Stored in localStorage. User: {cfg.userName || "—"} · {cfg.userEmail || "—"}</p>
      <button onClick={reset} className="rounded-xl border border-zinc-700 px-3 py-2 hover:bg-zinc-900">
        Reset to Defaults
      </button>
    </div>
  );
}
