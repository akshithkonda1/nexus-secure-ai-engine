import { useEffect, useRef, useState } from "react";
import CenterCanvas from "./CenterCanvas";
import BottomBar from "./BottomBar";
import WindowManager from "./windows/WindowManager";
import WindowQuickAccess from "./windows/WindowQuickAccess";
import { useBackgroundAnalysis } from "../../hooks/useBackgroundAnalysis";
import { CanvasMode } from "./types";

type WorkspaceSurfaceProps = {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  isCleared: boolean;
  onHome: () => void;
};

export default function WorkspaceSurface({ mode, onModeChange, isCleared, onHome }: WorkspaceSurfaceProps) {
  const canvasRef = useRef<HTMLElement | null>(null);
  const [canvasCenter, setCanvasCenter] = useState<number | null>(null);

  // Enable background AI analysis for pattern detection
  useBackgroundAnalysis(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCenter = () => {
      const rect = canvasRef.current?.getBoundingClientRect();
      setCanvasCenter(rect ? rect.left + rect.width / 2 : null);
    };

    updateCenter();

    const resizeObserver = new ResizeObserver(updateCenter);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener("resize", updateCenter);
    return () => {
      window.removeEventListener("resize", updateCenter);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[var(--bg-app)]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(132,106,255,0.16),transparent_36%),radial-gradient(circle_at_78%_6%,rgba(68,212,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_40%)]" />

      {/* Center Canvas (Focus Space) */}
      <div className="relative z-10 flex w-full flex-col gap-12 px-4 pb-28 pt-14">
        <CenterCanvas
          key={isCleared ? `${mode}-cleared` : mode}
          mode={mode}
          isCleared={isCleared}
          ref={canvasRef}
          className="w-full"
        />
      </div>

      {/* Window Quick Access Toolbar */}
      <WindowQuickAccess />

      {/* Floating Windows */}
      <WindowManager />

      {/* Bottom Bar */}
      <BottomBar mode={mode} onChange={onModeChange} onHome={onHome} anchorX={canvasCenter ?? undefined} />
    </div>
  );
}
