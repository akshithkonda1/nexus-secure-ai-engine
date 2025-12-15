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
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
        <ToronInput
          value={prompt}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-soft backdrop-blur-sm">
        <ToronResponse content={response} />
      </div>
    </div>
  );
}
