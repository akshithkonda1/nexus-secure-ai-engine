import { SwatchIcon } from '@heroicons/react/24/outline';

function SettingsPanel() {
  return (
    <div className="space-y-8">
      {/* Appearance */}
      <section>
        <h2 className="text-lg font-medium mb-3 flex items-center space-x-2">
          <SwatchIcon className="w-5 h-5" />
          <span>Appearance</span>
        </h2>
        <div className="flex space-x-2">
          {['Light', 'Dark', 'System'].map((m) => (
            <button
              key={m}
              className={`px-4 py-1.5 rounded-lg text-sm ${
                m === 'Dark' ? 'bg-primary text-white' : 'bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      {/* Providers */}
      <section>
        <h2 className="text-lg font-medium mb-3">Providers</h2>
        <div className="space-y-3">
          {['OpenAI GPT-4o', 'Anthropic Claude', 'Mistral Large'].map((p) => (
            <label key={p} className="flex items-center justify-between">
              <span>{p}</span>
              <input type="checkbox" className="toggle" defaultChecked={p !== 'Mistral Large'} />
            </label>
          ))}
        </div>
      </section>

      {/* Limits */}
      <section>
        <h2 className="text-lg font-medium mb-3">Limits & quotas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted">Daily requests</label>
            <input type="number" defaultValue={1500} className="mt-1 w-full bg-gray-800 rounded-lg px-3 py-1.5" />
          </div>
          <div>
            <label className="block text-sm text-muted">Max tokens</label>
            <input type="number" defaultValue={200000} className="mt-1 w-full bg-gray-800 rounded-lg px-3 py-1.5" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default SettingsPanel;
