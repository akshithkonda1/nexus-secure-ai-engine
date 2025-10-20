import { useConfig } from "../context/ConfigContext";

export default function Home() {
  const { cfg } = useConfig();
  return (
    <div className="space-y-2 text-zinc-300">
      <h1 className="text-2xl font-semibold">Welcome to Nexus</h1>
      <p className="text-zinc-400">Preferred model: <span className="text-white">{cfg.preferredModel}</span></p>
    </div>
  );
}
