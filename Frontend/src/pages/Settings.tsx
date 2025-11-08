import { useTheme } from '@/theme/useTheme';
import { SwatchBook, Shield, Server } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="section-title flex items-center gap-2">
          <SwatchBook className="h-5 w-5" /> Appearance
        </h2>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              className={`px-4 py-2 rounded-lg text-sm ${theme === m ? '' : 'opacity-80'}`}
              style={{
                background: theme === m ? 'rgba(37,99,235,0.18)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title flex items-center gap-2">
          <Server className="h-5 w-5" /> Providers
        </h2>
        <div className="space-y-3">
          {['OpenAI GPT-4o', 'Anthropic Claude', 'Mistral Large'].map((p, idx) => (
            <label key={p} className="flex items-center justify-between">
              <span className="opacity-90">{p}</span>
              <input type="checkbox" defaultChecked={idx < 2} />
            </label>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title flex items-center gap-2">
          <Shield className="h-5 w-5" /> Limits & Quotas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm opacity-75">Daily requests</label>
            <input type="number" defaultValue={1500} />
          </div>
          <div>
            <label className="text-sm opacity-75">Max tokens</label>
            <input type="number" defaultValue={200000} />
          </div>
        </div>
      </section>
    </div>
  );
}
