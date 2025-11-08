export function Settings() {
  return (
    <div className="container-page pt-20 pl-64 space-y-8">
      <section className="card p-6">
        <h2 className="section-title">Appearance</h2>
        <div className="flex gap-2">
          <button className="border">Light</button>
          <button className="border">Dark</button>
          <button className="border">System</button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">Providers</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>OpenAI GPT-4o</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Anthropic Claude</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Mistral Large</span>
            <input type="checkbox" className="h-4 w-4" />
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="section-title">Limits & quotas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-75 mb-1">Daily requests</div>
            <input type="number" defaultValue={1500} />
          </div>
          <div>
            <div className="text-sm opacity-75 mb-1">Max tokens</div>
            <input type="number" defaultValue={200000} />
          </div>
        </div>
      </section>
    </div>
  );
}
