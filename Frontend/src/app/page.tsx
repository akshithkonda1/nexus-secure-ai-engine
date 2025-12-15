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
    <div className="w-full max-w-6xl px-6">
      <div className="rounded-2xl bg-white/5 p-8 shadow-soft backdrop-blur space-y-8">
        <ToronInput value={prompt} onChange={handleChange} onSubmit={handleSubmit} />
        <ToronResponse content={response} />
      </div>
    </div>
  );
}
