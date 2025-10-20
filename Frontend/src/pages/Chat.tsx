import { useConfig } from "../context/ConfigContext";

export default function Chat() {
  const { cfg } = useConfig();
  return (
    <div className="space-y-3 text-zinc-300">
      <h2 className="text-xl font-semibold">Chat</h2>
      <p className="text-zinc-400">
        Routing policy preview — Web Search: {cfg.webSearchPercent}% • AI Models: {cfg.aiModelsPercent}%
        {cfg.useBothByDefault ? " • Using both" : " • Using one source"} •
        {cfg.consensusBeforeWebPrime ? " Consensus-first" : " Web-first"}
      </p>
      <div className="rounded-xl border border-zinc-800 p-4">Chat UI goes here…</div>
    </div>
  );
}
