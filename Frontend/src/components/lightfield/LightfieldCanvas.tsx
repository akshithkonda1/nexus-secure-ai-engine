import { useEffect, useRef } from "react";
import useLightfield from "./useLightfield";

type LightfieldCanvasProps = {
  className?: string;
};

export function LightfieldCanvas({ className = "" }: LightfieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { start, stop } = useLightfield(canvasRef);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden
    />
  );
}

export default LightfieldCanvas;
