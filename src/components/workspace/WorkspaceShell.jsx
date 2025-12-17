import React, { useCallback, useMemo, useState } from "react";
import WorkspaceCanvas from "./WorkspaceCanvas";
import OSBar from "./osbar/OSBar";
import ListsWidget from "../../widgets/lists/ListsWidget";
import CalendarWidget from "../../widgets/calendar/CalendarWidget";
import ConnectorsWidget from "../../widgets/connectors/ConnectorsWidget";
import TasksWidget from "../../widgets/tasks/TasksWidget";
import ToronOverlay from "./ToronOverlay";
import { useWorkspaceEnvelope } from "../../layout/workspaceEnvelope";

const canvasModes = ["pages", "notes", "boards", "flows"];

const WorkspaceShell = () => {
  const [canvasMode, setCanvasMode] = useState(null);
  const [toronOpen, setToronOpen] = useState(false);
  const envelope = useWorkspaceEnvelope();

  const handleSetMode = useCallback((next) => {
    if (next === "toron") {
      setToronOpen(true);
      return;
    }
    if (canvasModes.includes(next)) {
      setCanvasMode(next);
    }
  }, []);

  const stacked = envelope.mode === "stacked";
  const gridTemplate = useMemo(() => {
    if (stacked) return undefined;
    return `${envelope.leftWidgetWidth}px ${envelope.canvasWidth}px ${envelope.rightWidgetWidth}px`;
  }, [envelope.canvasWidth, envelope.leftWidgetWidth, envelope.rightWidgetWidth, stacked]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-10">
      <div className="relative mx-auto space-y-6" style={{ width: envelope.operatingSpan }}>
        <div
          className={`grid gap-4 ${stacked ? "grid-cols-1" : "items-start"}`}
          style={stacked ? undefined : { gridTemplateColumns: gridTemplate }}
        >
          <div
            className={`${stacked ? "order-2" : ""} flex flex-col gap-4`}
            style={stacked ? undefined : { width: envelope.leftWidgetWidth }}
          >
            <div className="min-h-[320px]">
              <ListsWidget />
            </div>
            <div className="min-h-[320px]">
              <CalendarWidget />
            </div>
          </div>

          <div className={stacked ? "order-1" : ""} style={stacked ? undefined : { width: envelope.canvasWidth }}>
            <WorkspaceCanvas mode={canvasMode} onClose={() => setCanvasMode(null)} envelopeMode={envelope.mode} />
          </div>

          <div
            className={`${stacked ? "order-3" : ""} flex flex-col gap-4`}
            style={stacked ? undefined : { width: envelope.rightWidgetWidth }}
          >
            <div className="min-h-[320px]">
              <ConnectorsWidget />
            </div>
            <div className="min-h-[320px]">
              <TasksWidget />
            </div>
          </div>
        </div>

        <OSBar
          activeMode={canvasMode}
          onSelect={handleSetMode}
          width={stacked ? envelope.operatingSpan : envelope.canvasWidth}
          offset={stacked ? 0 : envelope.leftWidgetWidth}
        />
      </div>

      <ToronOverlay open={toronOpen} onClose={() => setToronOpen(false)} />
    </div>
  );
};

export default WorkspaceShell;
