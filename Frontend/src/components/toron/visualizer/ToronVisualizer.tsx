import React, { useEffect, useRef } from "react";
import { createToronEngine } from "./toron-visual-engine";

interface ToronVisualizerProps {
  mode?: "orbital" | "graph";
  className?: string;
}

export const ToronVisualizer: React.FC<ToronVisualizerProps> = ({
  mode = "orbital",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createToronEngine> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    engineRef.current = createToronEngine(canvas);
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setMode(mode);
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full rounded-xl overflow-hidden backdrop-blur-xl border border-[var(--border-strong)] ${className}`}
    />
  );
};

export default ToronVisualizer;
