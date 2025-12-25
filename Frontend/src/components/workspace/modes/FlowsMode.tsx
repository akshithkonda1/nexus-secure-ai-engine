import { Zap, Power, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

export default function FlowsMode() {
  const flows = useWorkspace((state) => state.flows);
  const toggleFlow = useWorkspace((state) => state.toggleFlow);
  const deleteFlow = useWorkspace((state) => state.deleteFlow);

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">Automation Flows</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Automate your workspace with custom workflows
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto lg:grid-cols-2">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${flow.enabled ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                  <Zap className={`h-5 w-5 ${flow.enabled ? 'text-green-500' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)]">{flow.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{flow.trigger}</p>
                </div>
              </div>

              <button
                onClick={() => deleteFlow(flow.id)}
                className="text-[var(--text-muted)] hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
                Actions ({flow.actions.length})
              </p>
              {flow.actions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-lg bg-[var(--bg-elev)]/40 px-3 py-2 text-sm text-[var(--text)]"
                >
                  {action.type.replace('-', ' ')}
                </div>
              ))}
              {flow.actions.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] italic">No actions configured</p>
              )}
            </div>

            <button
              onClick={() => toggleFlow(flow.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium ${
                flow.enabled
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
              }`}
            >
              <Power className="h-4 w-4" />
              {flow.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}

        {flows.length === 0 && (
          <div className="col-span-full flex h-full items-center justify-center text-[var(--text-muted)]">
            No flows configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
