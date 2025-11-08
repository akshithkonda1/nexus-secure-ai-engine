import { useTheme } from "../theme/useTheme";
import { SwatchBook, ToggleRight } from "lucide-react";

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="pt-20 pl-64 pr-6 pb-10 space-y-8">
      <section className="card p-6">
        <h2 className="section-title flex items-center gap-2">
          <SwatchBook className="h-5 w-5" />
          Appearance
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`px-4 py-1.5 rounded-lg text-sm ${theme === "light" ? "bg-[color:var(--nexus-accent)] text-white" : ""}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-4 py-1.5 rounded-lg text-sm ${theme === "dark" ? "bg-[color:var(--nexus-accent)] text-white" : ""}`}
          >
            Dark
          </button>
          <div className="ml-3 inline-flex items-center gap-2 text-sm text-gray-400">
            <ToggleRight className="h-4 w-4" />
            Theme persists via localStorage
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">Providers</h2>
        <div className="space-y-3">
          {["OpenAI GPT-4o", "Anthropic Claude", "Mistral Large"].map((p, i) => (
            <label key={p} className="flex items-center justify-between">
              <span>{p}</span>
              <input type="checkbox" defaultChecked={i < 2} />
            </label>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">Limits & quotas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Daily requests</label>
            <input type="number" defaultValue={1500} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Max tokens</label>
            <input type="number" defaultValue={200000} className="mt-1" />
          </div>
        </div>
      </section>
    </div>
  );
}
