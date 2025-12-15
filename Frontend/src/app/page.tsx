import { useCallback, useState } from "react";
import TopBar from "../components/TopBar";
import ToronInput from "../components/ToronInput";
import ToronResponse from "../components/ToronResponse";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = useCallback(() => {
    const next = prompt.trim();
    if (!next) return;
    setResponse(next);
    setPrompt("");
  }, [prompt]);

  const handleChange = useCallback((value: string) => {
    setPrompt(value);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f0f14] via-[#1a1926] to-[#251c32]" />
      <div className="w-full max-w-6xl rounded-2xl bg-white/5 px-8 py-6 shadow-xl backdrop-blur-md">
        <TopBar />
        <div className="space-y-6 pt-4">
          <ToronInput value={prompt} onChange={handleChange} onSubmit={handleSubmit} />
          <ToronResponse content={response} />
        </div>
      </div>
    </div>
  );
}
