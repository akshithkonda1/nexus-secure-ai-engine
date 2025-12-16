import { Layout, Image, Code, FileText, Paperclip, Mic, Globe, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
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
    { label: "Create avatar", icon: Layout, color: "text-emerald-500", to: "/workspace" },
    { label: "Write code", icon: Code, color: "text-pink-500", to: "/toron" },
  ];

  return (
    <div className="flex h-full flex-col font-sans bg-black/20">
      {/* Center Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-12 pb-10">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-semibold tracking-tighter text-white">
            Welcome to Ryuzen
          </h1>
          <p className="mx-auto max-w-[500px] text-lg text-zinc-400">
            Unleash the power of autonomous AI agents. <br />
            What shall we build together today?
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 px-6 md:px-0">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className="group relative flex flex-col items-start gap-4 rounded-xl border border-white/5 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/80 hover:border-white/10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-white/10 group-hover:bg-zinc-800 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-zinc-200">{card.label}</span>
                <ArrowUp className="h-4 w-4 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 rotate-45" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="mx-auto w-full max-w-3xl shrink-0 px-6 pb-12">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-zinc-500/20 to-zinc-800/20 opacity-0 transition duration-500 group-hover:opacity-100 blur" />
          <form 
            onSubmit={handlePrompt}
            className="relative rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-2xl shadow-black/50 transition-all focus-within:ring-1 focus-within:ring-white/20"
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Ryuzen anything..."
              className="mb-12 w-full bg-transparent text-lg text-white outline-none placeholder:text-zinc-600 font-medium"
            />
            
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[
                  { icon: Paperclip, label: "Attach" },
                  { icon: Mic, label: "Voice" },
                  { icon: Globe, label: "Browse" }
                ].map(({ icon: Icon, label }) => (
                  <button type="button" key={label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              
              <button 
                type="submit"
                disabled={!prompt.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-xs font-medium text-zinc-600">
          Ryuzen AI Engine v2.0 • Secure Enclave Active
        </p>
      </div>
    </div>
  );
}
