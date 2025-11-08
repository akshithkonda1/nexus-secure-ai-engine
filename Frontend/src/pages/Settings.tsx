export function Settings() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="font-medium mb-3">Appearance</div>
        <div className="text-sm text-subtle">Theme toggles in the left rail (sun/moon button).</div>
      </section>
      <section className="card p-6">
        <div className="font-medium mb-3">Providers</div>
        <div className="text-subtle text-sm">OpenAI GPT-4o, Anthropic Claude, Mistral Large (toggles TBD)</div>
      </section>
    </div>
  );
}
