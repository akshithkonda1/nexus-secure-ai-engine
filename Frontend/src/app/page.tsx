import { useCallback, useState } from "react";
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
    <div className="relative isolate flex w-full justify-center self-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#12111a] via-[#17182b] to-[#231c33] opacity-90" />
      <div className="w-full max-w-6xl rounded-2xl bg-white/5 px-8 py-10 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)] backdrop-blur-md space-y-8">
        <ToronInput value={prompt} onChange={handleChange} onSubmit={handleSubmit} />
        <ToronResponse content={response} />
      </div>
    </div>
  );
}
