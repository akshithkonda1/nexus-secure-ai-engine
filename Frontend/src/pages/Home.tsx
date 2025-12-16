import { Layout, Image, Code, FileText, Paperclip, Mic, Globe, ArrowUp } from "lucide-react";
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
    <div className="flex h-full flex-col font-sans bg-[#FAFAFA]">
      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12 pb-10">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
            Welcome to Ryuzen
          </h1>
          <p className="mx-auto max-w-[500px] text-lg text-gray-600">
            Unleash the power of autonomous AI agents. <br />
            What shall we build together today?
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 px-6 md:px-0">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className="group relative flex flex-col items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-500 hover:scale-[1.01]"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                card.label === "Write copy" ? "bg-amber-100" :
                card.label === "Image generation" ? "bg-blue-100" :
                card.label === "Create avatar" ? "bg-emerald-100" :
                "bg-pink-100"
              }`}>
                <card.icon className={`h-6 w-6 ${
                  card.label === "Write copy" ? "text-amber-600" :
                  card.label === "Image generation" ? "text-blue-600" :
                  card.label === "Create avatar" ? "text-emerald-600" :
                  "text-pink-600"
                }`} />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-gray-900">{card.label}</span>
                <ArrowUp className="h-4 w-4 text-gray-400 transition-all group-hover:text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-6 pb-12">
        <form
          onSubmit={handlePrompt}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
        >
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Ryuzen anything..."
            className="mb-12 w-full bg-transparent text-lg text-gray-900 outline-none placeholder:text-gray-400 font-medium"
          />

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { icon: Paperclip, label: "Attach" },
                { icon: Mic, label: "Voice" },
                { icon: Globe, label: "Browse" }
              ].map(({ icon: Icon, label }) => (
                <button type="button" key={label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs font-medium text-gray-500">
          Ryuzen AI Engine v2.0 • Secure Enclave Active
        </p>
      </div>
    </div>
  );
}
