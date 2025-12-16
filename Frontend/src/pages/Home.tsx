import { Layout, Image, Code, FileText, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const handlePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/toron", { state: { initialPrompt: prompt } });
    }
  };

  const cards = [
    { label: "Write copy", icon: FileText, color: "text-amber-500", to: "/toron" },
    { label: "Image generation", icon: Image, color: "text-blue-500", to: "/toron" },
    { label: "Optimize Workflow", icon: Layout, color: "text-emerald-500", to: "/workspace" },
    { label: "Write Code", icon: Code, color: "text-pink-500", to: "/toron" },
  ];

  return (
    <div className="flex h-full flex-col font-sans bg-[#FAFAFA] dark:bg-slate-950">
      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12 pb-10">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
            Welcome to Ryuzen
          </h1>
          <p className="mx-auto max-w-[500px] text-lg text-gray-600 dark:text-slate-400">
            Unleash the power of autonomous AI agents. <br />
            What shall we build together today?
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-6 md:px-0">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className="group relative flex flex-col items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-500 hover:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                card.label === "Write copy" ? "bg-amber-100 dark:bg-amber-900/30" :
                card.label === "Image generation" ? "bg-blue-100 dark:bg-blue-900/30" :
                card.label === "Create avatar" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                "bg-pink-100 dark:bg-pink-900/30"
              }`}>
                <card.icon className={`h-6 w-6 ${
                  card.label === "Write copy" ? "text-amber-600 dark:text-amber-400" :
                  card.label === "Image generation" ? "text-blue-600 dark:text-blue-400" :
                  card.label === "Create avatar" ? "text-emerald-600 dark:text-emerald-400" :
                  "text-pink-600 dark:text-pink-400"
                }`} />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-slate-100">{card.label}</span>
                <ArrowUp className="h-4 w-4 text-gray-400 transition-all group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-6 pb-12">
        <form
          onSubmit={handlePrompt}
          className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-blue-900/50"
        >
          <div className="flex items-center gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Ryuzen anything..."
              className="flex-1 bg-transparent text-lg text-gray-900 outline-none placeholder:text-gray-400 font-medium dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-900"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs font-medium text-gray-500 dark:text-slate-400">
          Ryuzen AI Engine v2.0 • Secure Enclave Active
        </p>
      </div>
    </div>
  );
}
