import { useState } from "react";

import { testingApi } from "@/services/testingApi";

export default function RunTests() {
  const [scenario, setScenario] = useState("baseline");
  const [loadProfile, setLoadProfile] = useState("smoke");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (entry: string) => setMessages((prev) => [entry, ...prev.slice(0, 7)]);

  const runSim = async () => {
    setLoading(true);
    try {
      const result = await testingApi.runSim(scenario);
      log(`SIM run ${result.run_id} completed with snapshot ${result.snapshot_id}`);
    } catch (error) {
      log(`SIM failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const runLoad = async () => {
    setLoading(true);
    try {
      const result = await testingApi.runLoad(loadProfile, 12, 60);
      log(`Load run ${result.run_id} completed for ${loadProfile}`);
    } catch (error) {
      log(`Load failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const runReplay = async () => {
    setLoading(true);
    try {
      const result = await testingApi.runSimReplay();
      log(`Replay executed: ${result.run_id}`);
    } catch (error) {
      log(`Replay failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4">
        <h2 className="text-xl font-semibold">SIM runner</h2>
        <p className="text-sm text-[var(--text-secondary)]">Run individual or batch SIM suites.</p>
        <div className="mt-3 space-y-2">
          <label className="block text-sm text-[var(--text-secondary)]">Scenario name</label>
          <input
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={runSim}
            disabled={loading}
            className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow-lg"
          >
            Run SIM
          </button>
          <button
            type="button"
            onClick={() => testingApi.runSimFull().then((r) => log(`Full suite ${r.run_id} executed`))}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Full suite
          </button>
          <button
            type="button"
            onClick={() => testingApi.runSimStress(80, 90).then((r) => log(`Stress ${r.run_id} x${r.concurrency}`))}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Stress
          </button>
        </div>
        <button
          type="button"
          onClick={() => testingApi.runSimBatch(["baseline", "pii-redaction", "throughput-flood"]).then((r) => log(`Batch ${r.run_id}`))}
          className="mt-3 w-full rounded-lg border border-[var(--border-soft)] px-3 py-2"
        >
          Batch SIM suite
        </button>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Load generator</h2>
        <p className="text-sm text-[var(--text-secondary)]">Trigger deterministic load tests.</p>
        <div className="mt-3 space-y-2">
          <label className="block text-sm text-[var(--text-secondary)]">Profile</label>
          <input
            value={loadProfile}
            onChange={(e) => setLoadProfile(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={runLoad}
            disabled={loading}
            className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow-lg"
          >
            Run load
          </button>
          <button
            type="button"
            onClick={() => testingApi.runCustomLoad("burst", 800, 120).then((r) => log(`Custom ${r.run_id} -> ${r.target_rps} rps`))}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Custom load
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Replay & telemetry</h2>
        <p className="text-sm text-[var(--text-secondary)]">Replay snapshots and quarantine noisy signals.</p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={runReplay}
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow-lg"
          >
            Trigger replay
          </button>
          <button
            type="button"
            onClick={() => testingApi.scrubTelemetry("frontend scrub").then((r) => log(r.status))}
            className="w-full rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Scrub telemetry
          </button>
          <button
            type="button"
            onClick={() => testingApi.quarantineTelemetry("High error budget", ["latency", "timeouts"]).then((r) => log(`${r.status} ${r.reason}`))}
            className="w-full rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Quarantine signals
          </button>
        </div>
      </section>

      <section className="lg:col-span-3 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Control console</h2>
        <p className="text-sm text-[var(--text-secondary)]">Streaming results from control actions.</p>
        <div className="mt-3 space-y-2 text-sm">
          {messages.map((msg, idx) => (
            <div key={idx} className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-2">
              {msg}
            </div>
          ))}
          {messages.length === 0 && <p className="text-[var(--text-secondary)]">No actions yet.</p>}
        </div>
      </section>
    </div>
  );
}
