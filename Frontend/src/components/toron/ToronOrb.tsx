import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ToronStageState } from "../../state/useToron";

export interface ToronOrbProps {
  state: ToronStageState;
  stageLabel?: string | null;
  progress?: number | null;
}

type OrbPalette = {
  core: string;
  mid: string;
  rim: string;
  halo: string;
  highlight: string;
  shadow: string;
  lens: string;
};

const STATE_COPY: Record<ToronStageState, string> = {
  idle: "Ready",
  processing: "Analyzing",
  escalation: "Escalating",
  disagreement: "Reconciling",
  consensus: "Complete",
  error: "Recovering",
};

const PALETTES: Record<ToronStageState, OrbPalette> = {
  idle: {
    core: "#d89bff",
    mid: "#4b2c91",
    rim: "#0c0f26",
    halo: "rgba(126, 211, 255, 0.28)",
    highlight: "#dff5ff",
    shadow: "rgba(4, 6, 18, 0.9)",
    lens: "rgba(144, 248, 255, 0.24)",
  },
  processing: {
    core: "#cdd5ff",
    mid: "#3d2b92",
    rim: "#0d0f23",
    halo: "rgba(142, 255, 234, 0.32)",
    highlight: "#e7fbff",
    shadow: "rgba(5, 8, 20, 0.92)",
    lens: "rgba(166, 255, 242, 0.28)",
  },
  escalation: {
    core: "#f5b3ff",
    mid: "#5e1f8a",
    rim: "#120c2d",
    halo: "rgba(236, 189, 255, 0.32)",
    highlight: "#ffe8ff",
    shadow: "rgba(10, 8, 28, 0.9)",
    lens: "rgba(227, 194, 255, 0.24)",
  },
  disagreement: {
    core: "#d1a9ff",
    mid: "#423192",
    rim: "#0e0f26",
    halo: "rgba(200, 182, 255, 0.28)",
    highlight: "#f1edff",
    shadow: "rgba(6, 7, 22, 0.9)",
    lens: "rgba(182, 201, 255, 0.24)",
  },
  consensus: {
    core: "#c8fff4",
    mid: "#2d3c8f",
    rim: "#081023",
    halo: "rgba(168, 255, 231, 0.34)",
    highlight: "#e7fff9",
    shadow: "rgba(4, 10, 16, 0.9)",
    lens: "rgba(172, 255, 236, 0.28)",
  },
  error: {
    core: "#a9b8ff",
    mid: "#1d2757",
    rim: "#060816",
    halo: "rgba(126, 158, 255, 0.26)",
    highlight: "#dce9ff",
    shadow: "rgba(3, 4, 12, 0.92)",
    lens: "rgba(146, 172, 255, 0.2)",
  },
};

const ToronOrb: React.FC<ToronOrbProps> = ({ state, stageLabel, progress }) => {
  const prefersReducedMotion = useReducedMotion();
  const [held, setHeld] = useState(false);
  const [light, setLight] = useState({ x: 0.24, y: 0.24 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const palette = useMemo(() => PALETTES[state], [state]);
  const caption = stageLabel || STATE_COPY[state];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();
      const size = rect ? Math.min(rect.width, rect.height) : 120;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2.08;
      const hx = cx + (light.x - 0.5) * radius * 0.9;
      const hy = cy + (light.y - 0.5) * radius * 0.9;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = palette.shadow;
      ctx.fillRect(0, 0, size, size);

      const body = ctx.createRadialGradient(cx * 0.92, cy * 0.88, radius * 0.06, cx, cy, radius * 1.08);
      body.addColorStop(0, palette.core);
      body.addColorStop(0.24, palette.mid);
      body.addColorStop(0.54, palette.rim);
      body.addColorStop(1, "#050711");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = body;
      ctx.fillRect(0, 0, size, size);

      const banding = ctx.createRadialGradient(cx, cy * 0.92, radius * 0.06, cx, cy * 1.08, radius * 0.92);
      banding.addColorStop(0, "rgba(116, 74, 196, 0.42)");
      banding.addColorStop(0.3, "rgba(94, 64, 186, 0.38)");
      banding.addColorStop(0.72, "rgba(34, 22, 70, 0.12)");
      banding.addColorStop(1, "rgba(6, 6, 18, 0.04)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = banding;
      ctx.fillRect(0, 0, size, size);

      const subsurface = ctx.createRadialGradient(cx * 0.98, cy * 0.86, radius * 0.06, cx, cy, radius * 0.92);
      subsurface.addColorStop(0, "rgba(176, 246, 255, 0.52)");
      subsurface.addColorStop(0.2, "rgba(144, 214, 255, 0.48)");
      subsurface.addColorStop(0.56, "rgba(104, 88, 214, 0.28)");
      subsurface.addColorStop(1, "rgba(28, 18, 60, 0.08)");
      ctx.fillStyle = subsurface;
      ctx.fillRect(0, 0, size, size);

      const highlight = ctx.createRadialGradient(hx, hy, radius * 0.02, hx, hy, radius * 0.65);
      highlight.addColorStop(0, palette.highlight);
      highlight.addColorStop(0.1, "rgba(255, 255, 255, 0.86)");
      highlight.addColorStop(0.24, "rgba(224, 242, 255, 0.38)");
      highlight.addColorStop(1, "rgba(80, 110, 200, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, size, size);

      const rim = ctx.createRadialGradient(cx, cy, radius * 0.42, cx, cy, radius * 1.04);
      rim.addColorStop(0, "rgba(0, 0, 0, 0)");
      rim.addColorStop(0.64, "rgba(20, 26, 56, 0.16)");
      rim.addColorStop(1, "rgba(0, 0, 0, 0.48)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, size, size);

      const caustic = ctx.createRadialGradient(cx * 0.9, cy * 0.8, radius * 0.05, cx, cy * 0.98, radius * 0.92);
      caustic.addColorStop(0, palette.lens);
      caustic.addColorStop(0.42, "rgba(255, 255, 255, 0.22)");
      caustic.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = caustic;
      ctx.fillRect(0, 0, size, size);

      const innerCore = ctx.createRadialGradient(cx, cy * 1.02, radius * 0.02, cx, cy, radius * 0.46);
      innerCore.addColorStop(0, "rgba(212, 255, 255, 0.95)");
      innerCore.addColorStop(0.15, "rgba(164, 236, 255, 0.7)");
      innerCore.addColorStop(0.4, "rgba(124, 144, 255, 0.4)");
      innerCore.addColorStop(0.76, "rgba(36, 34, 82, 0.1)");
      innerCore.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = innerCore;
      ctx.fillRect(0, 0, size, size);

      const rimLight = ctx.createRadialGradient(cx * 1.1, cy * 0.86, radius * 0.2, cx, cy, radius * 1.12);
      rimLight.addColorStop(0, "rgba(180, 226, 255, 0.14)");
      rimLight.addColorStop(0.3, "rgba(124, 172, 255, 0.12)");
      rimLight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = rimLight;
      ctx.fillRect(0, 0, size, size);

      const grain = ctx.createLinearGradient(0, 0, size, size);
      grain.addColorStop(0, "rgba(255,255,255,0.02)");
      grain.addColorStop(1, "rgba(0,0,0,0.02)");
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = grain;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();
    };

    render();

    const observer = new ResizeObserver(render);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      observer.disconnect();
    };
  }, [light, palette]);

  const handlePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setLight({ x: Math.min(Math.max(x, 0), 1), y: Math.min(Math.max(y, 0), 1) });

    if (!prefersReducedMotion) {
      setTilt({ x: (x - 0.5) * 12, y: (0.5 - y) * 12 });
    }
  };

  return (
    <div className={`toron-orb-shell state-${state}${held ? " held" : ""}`}>
      <motion.div
        className="toron-orb"
        style={{
          ["--toron-orb-halo" as string]: palette.halo,
          ["--toron-orb-rim" as string]: palette.rim,
          ["--toron-orb-highlight" as string]: palette.highlight,
          ["--orb-tilt-x" as string]: `${tilt.x}deg`,
          ["--orb-tilt-y" as string]: `${tilt.y}deg`,
          ["--orb-scale" as string]: held ? 1.02 : 1,
        }}
        onMouseDown={() => setHeld(true)}
        onMouseUp={() => setHeld(false)}
        onMouseLeave={() => {
          setHeld(false);
          setLight({ x: 0.24, y: 0.24 });
          setTilt({ x: 0, y: 0 });
        }}
        onPointerMove={prefersReducedMotion ? undefined : handlePointer}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 1.08 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <canvas ref={canvasRef} className="toron-orb-canvas" aria-hidden />
        <div className="toron-orb-glass" aria-hidden />
      </motion.div>
      <div className="toron-orb-caption" aria-live="polite">
        <span className="toron-orb-stage">{caption}</span>
        {progress !== null && progress !== undefined && (
          <span className="toron-orb-progress">{Math.round(progress * 100)}%</span>
        )}
      </div>
    </div>
  );
};

export default ToronOrb;
