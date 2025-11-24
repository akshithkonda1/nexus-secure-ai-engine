import { useEffect, useRef } from "react";
import { createToronEngine, ToronEngineMode, ToronEvent } from "./toron-visual-engine";

interface ToronVisualizerProps {
  mode?: ToronEngineMode;
  className?: string;
  event?: { type: string; strength?: number };
}

export function ToronVisualizer({ mode = "orbital", className, event }: ToronVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createToronEngine> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    const engine = createToronEngine(canvasRef.current);
    engineRef.current = engine;
    engine.setMode(mode);
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!engineRef.current || !event || !event.type) return;
    const evt = event as ToronEvent;
    engineRef.current.triggerEvent(evt);
  }, [event]);

  return <canvas ref={canvasRef} className={className} />;
}
