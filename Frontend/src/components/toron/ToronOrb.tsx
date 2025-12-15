import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../../state/theme";
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

const PALETTES: Record<"light" | "dark", Record<ToronStageState, OrbPalette>> = {
  light: {
    idle: {
      core: "#dff1ff",
      mid: "#8aa0f0",
      rim: "#4c5b9c",
      halo: "rgba(166, 255, 230, 0.32)",
      highlight: "#f9fdff",
      shadow: "rgba(12, 18, 32, 0.82)",
      lens: "rgba(162, 236, 255, 0.32)",
    },
    processing: {
      core: "#def5ff",
      mid: "#91a7ef",
      rim: "#4b5f9a",
      halo: "rgba(158, 244, 231, 0.34)",
      highlight: "#f7fbff",
      shadow: "rgba(10, 16, 32, 0.84)",
      lens: "rgba(144, 224, 255, 0.3)",
    },
    escalation: {
      core: "#f6e4ff",
      mid: "#a28cf4",
      rim: "#5c63a8",
      halo: "rgba(194, 220, 255, 0.32)",
      highlight: "#ffffff",
      shadow: "rgba(16, 20, 38, 0.8)",
      lens: "rgba(200, 230, 255, 0.26)",
    },
    disagreement: {
      core: "#e9ddff",
      mid: "#9aa1f4",
      rim: "#5661a6",
      halo: "rgba(186, 214, 255, 0.3)",
      highlight: "#fbfdff",
      shadow: "rgba(14, 18, 34, 0.82)",
      lens: "rgba(180, 210, 255, 0.26)",
    },
    consensus: {
      core: "#d8fff0",
      mid: "#80a8ef",
      rim: "#4c5f9c",
      halo: "rgba(160, 255, 230, 0.34)",
      highlight: "#f6fffb",
      shadow: "rgba(10, 18, 32, 0.82)",
      lens: "rgba(168, 240, 250, 0.32)",
    },
    error: {
      core: "#dbe6ff",
      mid: "#7586d2",
      rim: "#435182",
      halo: "rgba(150, 180, 255, 0.26)",
      highlight: "#f4f8ff",
      shadow: "rgba(12, 18, 30, 0.84)",
      lens: "rgba(156, 188, 255, 0.24)",
    },
  },
  dark: {
    idle: {
      core: "#c7a6ff",
      mid: "#3b2367",
      rim: "#0a0c1f",
      halo: "rgba(88, 236, 203, 0.3)",
      highlight: "#f5f7ff",
      shadow: "rgba(2, 4, 12, 0.94)",
      lens: "rgba(122, 210, 255, 0.24)",
    },
    processing: {
      core: "#c5cfff",
      mid: "#35276b",
      rim: "#0a0c1f",
      halo: "rgba(100, 236, 210, 0.32)",
      highlight: "#eef5ff",
      shadow: "rgba(2, 4, 12, 0.94)",
      lens: "rgba(128, 224, 255, 0.26)",
    },
    escalation: {
      core: "#deb0ff",
      mid: "#43227a",
      rim: "#0c0d26",
      halo: "rgba(186, 132, 255, 0.34)",
      highlight: "#fbefff",
      shadow: "rgba(3, 4, 14, 0.94)",
      lens: "rgba(192, 148, 255, 0.26)",
    },
    disagreement: {
      core: "#ceb6ff",
      mid: "#342c82",
      rim: "#0a0c1f",
      halo: "rgba(164, 156, 255, 0.3)",
      highlight: "#f5f1ff",
      shadow: "rgba(2, 3, 14, 0.94)",
      lens: "rgba(158, 170, 255, 0.24)",
    },
    consensus: {
      core: "#b6fff1",
      mid: "#2a3c87",
      rim: "#081022",
      halo: "rgba(94, 232, 204, 0.36)",
      highlight: "#eafff9",
      shadow: "rgba(2, 4, 12, 0.94)",
      lens: "rgba(128, 246, 236, 0.28)",
    },
    error: {
      core: "#adbeff",
      mid: "#1f255c",
      rim: "#070917",
      halo: "rgba(108, 138, 255, 0.3)",
      highlight: "#e7f0ff",
      shadow: "rgba(2, 3, 12, 0.95)",
      lens: "rgba(138, 168, 255, 0.22)",
    },
  },
};

const ToronOrb: React.FC<ToronOrbProps> = ({ state, stageLabel, progress }) => {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [held, setHeld] = useState(false);
  const [light, setLight] = useState({ x: 0.24, y: 0.24 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const palette = useMemo(() => PALETTES[theme][state], [state, theme]);
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

      const body = ctx.createRadialGradient(cx * 0.9, cy * 0.92, radius * 0.06, cx, cy, radius * 1.12);
      body.addColorStop(0, palette.core);
      body.addColorStop(0.26, palette.mid);
      body.addColorStop(0.62, palette.rim);
      body.addColorStop(1, "#040614");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = body;
      ctx.fillRect(0, 0, size, size);

      const baseAurora = ctx.createRadialGradient(cx * 0.78, cy * 0.42, radius * 0.08, cx * 0.82, cy * 0.58, radius * 0.94);
      baseAurora.addColorStop(0, "rgba(230, 180, 255, 0.38)");
      baseAurora.addColorStop(0.24, "rgba(190, 148, 255, 0.32)");
      baseAurora.addColorStop(0.6, "rgba(70, 36, 120, 0.18)");
      baseAurora.addColorStop(1, "rgba(18, 14, 42, 0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = baseAurora;
      ctx.fillRect(0, 0, size, size);

      const polarBand = ctx.createRadialGradient(cx * 1.04, cy * 1.05, radius * 0.2, cx * 1.02, cy * 0.94, radius * 0.82);
      polarBand.addColorStop(0, "rgba(78, 186, 255, 0.38)");
      polarBand.addColorStop(0.32, "rgba(66, 168, 246, 0.32)");
      polarBand.addColorStop(0.68, "rgba(28, 38, 98, 0.24)");
      polarBand.addColorStop(1, "rgba(6, 10, 24, 0)");
      ctx.fillStyle = polarBand;
      ctx.fillRect(0, 0, size, size);

      const highlight = ctx.createRadialGradient(hx, hy, radius * 0.02, hx, hy, radius * 0.65);
      highlight.addColorStop(0, palette.highlight);
      highlight.addColorStop(0.1, "rgba(255, 255, 255, 0.86)");
      highlight.addColorStop(0.24, "rgba(224, 242, 255, 0.38)");
      highlight.addColorStop(1, "rgba(80, 110, 200, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, size, size);

      const crest = ctx.createRadialGradient(cx * 0.58, cy * 0.26, radius * 0.02, cx * 0.62, cy * 0.32, radius * 0.32);
      crest.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      crest.addColorStop(0.16, "rgba(240, 224, 255, 0.46)");
      crest.addColorStop(0.44, "rgba(178, 156, 255, 0.2)");
      crest.addColorStop(1, "rgba(80, 100, 180, 0)");
      ctx.fillStyle = crest;
      ctx.fillRect(0, 0, size, size);

      const rim = ctx.createRadialGradient(cx, cy, radius * 0.42, cx, cy, radius * 1.04);
      rim.addColorStop(0, "rgba(0, 0, 0, 0)");
      rim.addColorStop(0.64, "rgba(20, 26, 56, 0.16)");
      rim.addColorStop(1, "rgba(0, 0, 0, 0.48)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = rim;
      ctx.fillRect(0, 0, size, size);

      const caustic = ctx.createRadialGradient(cx * 0.9, cy * 0.82, radius * 0.05, cx, cy * 1.02, radius * 0.96);
      caustic.addColorStop(0, palette.lens);
      caustic.addColorStop(0.4, "rgba(255, 255, 255, 0.26)");
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

      const rimLight = ctx.createRadialGradient(cx * 1.04, cy * 0.84, radius * 0.22, cx, cy, radius * 1.16);
      rimLight.addColorStop(0, "rgba(178, 226, 255, 0.16)");
      rimLight.addColorStop(0.28, "rgba(144, 186, 255, 0.14)");
      rimLight.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = rimLight;
      ctx.fillRect(0, 0, size, size);

      const shimmer = ctx.createRadialGradient(cx * 0.3, cy * 0.68, radius * 0.08, cx * 0.44, cy * 0.74, radius * 0.48);
      shimmer.addColorStop(0, "rgba(120, 244, 226, 0.26)");
      shimmer.addColorStop(0.24, "rgba(92, 200, 255, 0.22)");
      shimmer.addColorStop(0.6, "rgba(48, 74, 164, 0.12)");
      shimmer.addColorStop(1, "rgba(10, 18, 40, 0)");
      ctx.fillStyle = shimmer;
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
