import { memo } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeRender } from "@/shared/lib/safeRender";
import { safeArray, safeString } from "@/shared/lib/toronSafe";
import type { ToronProject } from "./toronTypes";

interface ToronProjectsModalProps {
  projects?: ToronProject[];
  onClose?: () => void;
}

const Modal = ({ projects, onClose }: ToronProjectsModalProps) => {
  const telemetry = useToronTelemetry();
  const list = safeArray(projects, []);

  return safeRender(
    () => (
      <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--panel-strong)] p-4 shadow-lg" role="dialog">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Projects</h3>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {list.map((project) => (
            <li key={safeString(project.id)} className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-2 text-sm text-[var(--text-primary)]">
              {safeString(project.name, "Untitled Project")}
            </li>
          ))}
          {list.length === 0 && (
            <li className="rounded border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              No projects available.
            </li>
          )}
        </ul>
      </div>
    ),
    <div className="rounded border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3 text-sm text-[var(--text-secondary)]">
      Projects unavailable.
    </div>,
  );
};

export const ToronProjectsModal = memo(Modal);

export default ToronProjectsModal;
