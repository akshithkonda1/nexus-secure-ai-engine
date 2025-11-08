import { ArrowRight, FileText, Layers, MessageCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();

  const actions = [
    { title: "New session", desc: "Start a fresh multi-model debate.", to: "/chat", icon: MessageCircle },
    { title: "Import Documents", desc: "Upload documents for ingestation and to allow us to create templates to help with your workflow.", to: "/documents", icon: FileText },
    { title: "Templates", desc: "Kick off debates using custom-made prompts or Templates based on your data to optimize your time.", to: "/templates", icon: Layers },
    { title: "Settings", desc: "Customize your Nexus Debate Experience.", to: "/settings", icon: Settings }
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pt-8">
      <section className="panel px-8 py-10 shadow-card">
        <p className="mb-2 text-xs font-semibold tracking-widest text-[rgb(var(--subtle))]">
          NEXUS BETA
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Nexus.ai</h1>
        <p className="mt-2 max-w-[64ch] text-[rgb(var(--subtle))]">
          An AI Debate Engine orchestration that feels natural.
       Nexus allows you to debate multiple engines at once while also validating its own results quickly but also helps you know how the model came to that answer.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn" onClick={() => navigate("/chat")}>
            Launch Console <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <button className="btn" onClick={() => navigate("/templates")}>
            Browse Templates <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.title}
              className="panel group text-left px-5 py-5 transition-shadow hover:shadow-card"
              onClick={() => navigate(a.to)}
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)] text-white">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-base font-medium">{a.title}</div>
              <div className="mt-1 text-sm text-[rgb(var(--subtle))]">{a.desc}</div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
