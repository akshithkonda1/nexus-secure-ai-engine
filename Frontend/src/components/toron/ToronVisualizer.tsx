import { useEffect, useRef, type MutableRefObject } from "react";
import { useTheme } from "@/theme/useTheme";
import { buildResonanceBands } from "./utils/buildResonanceBands";
import { buildWaveform } from "./utils/buildWaveform";
import { Pulse, buildPulse, pulseProgress } from "./utils/buildPulses";
import { alpha, lerpColor, semanticColor } from "./utils/colors";

export type ToronState = "thinking" | "responding" | "error" | "idle";

export interface ToronVisualizerProps {
  width?: number;
  height?: number;
  message?: string;
  metadata?: {
    sentiment?: number; // -1 → 1
    confidence?: number; // 0 → 1
    biasScore?: number; // 0 → 1
    hallucinationRisk?: number; // 0 → 1
    complexity?: number; // 0 → 1
    state?: ToronState;
    llmAgreement?: number; // 0 → 1
  };
}

const defaultMetadata: Required<NonNullable<ToronVisualizerProps["metadata"]>> = {
  sentiment: 0,
  confidence: 0.62,
  biasScore: 0.18,
  hallucinationRisk: 0.14,
  complexity: 0.45,
  state: "idle",
  llmAgreement: 0.5,
};

type Palette = {
  accentPrimary: string;
  accentSecondary: string;
  panelStrong: string;
  panelElevated: string;
  textPrimary: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getCssVar = (name: string, fallback: string) => {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value?.trim() || fallback;
};

const resolvePalette = (theme: "light" | "dark"): Palette => ({
  accentPrimary: getCssVar("--accent-primary", theme === "dark" ? "#38bdf8" : "#10b981"),
  accentSecondary: getCssVar("--accent-secondary", theme === "dark" ? "#a855f7" : "#7c3aed"),
  panelStrong: getCssVar("--panel-strong", theme === "dark" ? "#0b1021" : "#eef2ff"),
  panelElevated: getCssVar("--panel-elevated", theme === "dark" ? "#111827" : "#ffffff"),
  textPrimary: getCssVar("--text-primary", theme === "dark" ? "#e5e7eb" : "#0f172a"),
});

const semanticStateFromMetadata = (meta: Required<ToronVisualizerProps["metadata"]>) => {
  if (meta.state === "error" || meta.hallucinationRisk > 0.65) return "instability" as const;
  if (meta.sentiment > 0.25 && meta.llmAgreement > 0.55) return "agreement" as const;
  if (meta.sentiment < -0.25 || meta.biasScore > 0.55) return "disagreement" as const;
  if (meta.state === "responding" || meta.complexity > 0.6) return "creativity" as const;
  return "analysis" as const;
};

const drawPath = (
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  close: boolean,
) => {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (close) ctx.closePath();
};

const usePrevious = <T,>(value: T): MutableRefObject<T> => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

const drawWaveform = (
  ctx: CanvasRenderingContext2D,
  meta: Required<ToronVisualizerProps["metadata"]>,
  palette: Palette,
  timestamp: number,
  centerRadius: number,
  respondingPhase: number,
  theme: "light" | "dark",
) => {
  const baseRadius = centerRadius + 34;
  const waveform = buildWaveform({
    amplitude: meta.confidence,
    jitter: meta.hallucinationRisk,
    baseRadius,
    time: timestamp,
    respondingBoost: respondingPhase,
  });

  const rotation = timestamp * (0.0006 + respondingPhase * 0.0012);
  const semantic = semanticStateFromMetadata(meta);
  const waveColor = semanticColor(semantic, theme);
  const gradient = ctx.createLinearGradient(-baseRadius, 0, baseRadius, 0);
  gradient.addColorStop(0, alpha(waveColor, 0.2));
  gradient.addColorStop(0.5, alpha(waveColor, 0.92));
  gradient.addColorStop(1, alpha(lerpColor(waveColor, palette.accentSecondary, 0.4), 0.18));

  ctx.save();
  ctx.rotate(rotation);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = gradient;
  const points = waveform.map((point) => ({
    x: Math.cos(point.angle) * point.radius,
    y: Math.sin(point.angle) * point.radius,
  }));
  drawPath(ctx, points, true);
  ctx.stroke();
  ctx.restore();
};

const drawResonanceBands = (
  ctx: CanvasRenderingContext2D,
  meta: Required<ToronVisualizerProps["metadata"]>,
  palette: Palette,
  timestamp: number,
  centerRadius: number,
  respondingPhase: number,
) => {
  const bandCount = 3 + Math.round(clamp(meta.llmAgreement, 0, 1) * 2);
  const bands = buildResonanceBands({
    count: bandCount,
    baseRadius: centerRadius + 14,
    llmAgreement: meta.llmAgreement,
    biasScore: meta.biasScore,
    hallucinationRisk: meta.hallucinationRisk,
    time: timestamp,
    themeColor: palette.accentSecondary,
    respondingBoost: respondingPhase,
  });

  bands.forEach((band) => {
    ctx.save();
    ctx.rotate(band.rotation);
    ctx.lineWidth = band.thickness;
    ctx.strokeStyle = alpha(band.color, 0.45 + 0.25 * (1 - band.distortion / 12));

    const arcPoints: { x: number; y: number }[] = [];
    const steps = 90;
    for (let i = 0; i <= steps; i += 1) {
      const angle = (i / steps) * Math.PI * 2;
      const wobble = Math.sin(angle * (2 + band.distortion * 0.2) + band.rotation) * band.distortion;
      const radius = band.radius + wobble;
      arcPoints.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    drawPath(ctx, arcPoints, true);
    ctx.stroke();
    ctx.restore();
  });
};

const drawPulses = (
  ctx: CanvasRenderingContext2D,
  pulses: MutableRefObject<Pulse[]>,
  now: number,
  palette: Palette,
  respondingPhase: number,
  meta: Required<ToronVisualizerProps["metadata"]>,
) => {
  const remaining: Pulse[] = [];
  pulses.current.forEach((pulse) => {
    const progress = pulseProgress(pulse, now);
    if (progress >= 1) return;
    remaining.push(pulse);

    const eased = progress * progress * (3 - 2 * progress);
    const opacity = (1 - eased) * (0.65 + respondingPhase * 0.2);
    const length = 70 + pulse.intensity * 60 + respondingPhase * 24;
    const thickness = 1.2 + pulse.intensity * 1.6 + respondingPhase * 0.8;

    let angle = 0;
    switch (pulse.kind) {
      case "ascending":
        angle = -Math.PI / 2 + eased * 0.8;
        break;
      case "forward":
        angle = Math.PI / 6 + eased * 1.2;
        break;
      case "bloom":
        angle = eased * Math.PI * 2;
        break;
      case "tight":
        angle = -Math.PI / 3 + eased * 0.3;
        break;
    }

    const radialOffset = (meta.complexity + meta.confidence) * 12;
    const startRadius = 10 + radialOffset + eased * 8;
    const endRadius = startRadius + length;

    const startX = Math.cos(angle) * startRadius;
    const startY = Math.sin(angle) * startRadius;
    const endX = Math.cos(angle) * endRadius;
    const endY = Math.sin(angle) * endRadius;

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, alpha(palette.accentPrimary, opacity));
    gradient.addColorStop(0.6, alpha(palette.accentSecondary, opacity * 0.9));
    gradient.addColorStop(1, alpha(palette.textPrimary, opacity * 0.4));

    ctx.save();
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  });

  pulses.current = remaining;
};

const drawToronCore = (
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  corePulse: number,
  meta: Required<ToronVisualizerProps["metadata"]>,
) => {
  const coreRadius = 26 + meta.confidence * 6 + corePulse * 8;
  const gradient = ctx.createRadialGradient(0, 0, coreRadius * 0.2, 0, 0, coreRadius);
  gradient.addColorStop(0, alpha(palette.accentPrimary, 0.95));
  gradient.addColorStop(0.45, alpha(palette.accentSecondary, 0.6));
  gradient.addColorStop(1, alpha(palette.panelElevated, 0.32));

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.shadowColor = alpha(palette.accentPrimary, 0.6 + corePulse * 0.35);
  ctx.shadowBlur = 24 + corePulse * 12;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawResponseOverlay = (
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  timestamp: number,
  respondingPhase: number,
  radius: number,
) => {
  if (respondingPhase <= 0.001) return;
  const stripes = 12;
  const sweepSpeed = 0.0024;
  const sweep = timestamp * sweepSpeed;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < stripes; i += 1) {
    const angle = (i / stripes) * Math.PI * 2 + sweep;
    const inner = radius + i * 3;
    const outer = inner + 32 + respondingPhase * 20;
    const thickness = 0.7 + respondingPhase * 1.6;

    const startX = Math.cos(angle) * inner;
    const startY = Math.sin(angle) * inner;
    const endX = Math.cos(angle) * outer;
    const endY = Math.sin(angle) * outer;

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, alpha(palette.accentSecondary, 0.22 * respondingPhase));
    gradient.addColorStop(1, alpha(palette.accentPrimary, 0.68 * respondingPhase));

    ctx.strokeStyle = gradient;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.restore();
};

export function ToronVisualizer({
  width = 420,
  height = 420,
  message = "",
  metadata = defaultMetadata,
}: ToronVisualizerProps) {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<Palette>(resolvePalette(resolvedTheme));
  const pulsesRef = useRef<Pulse[]>([]);
  const metadataRef = useRef<Required<ToronVisualizerProps["metadata"]>>({
    ...defaultMetadata,
    ...metadata,
  });
  metadataRef.current = { ...defaultMetadata, ...metadata };
  const previousMessage = usePrevious(message);
  const responsePhaseRef = useRef(0);

  useEffect(() => {
    paletteRef.current = resolvePalette(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const now = performance.now();
    if (message && message !== previousMessage.current) {
      pulsesRef.current = [
        ...pulsesRef.current,
        buildPulse(message, now, metadataRef.current.confidence),
      ];
    }
  }, [message, previousMessage, metadataRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationFrame: number;
    let lastTimestamp = performance.now();

    const render = (timestamp: number) => {
      const meta = metadataRef.current;
      const palette = paletteRef.current;

      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      canvas.width = width;
      canvas.height = height;
      const centerX = width / 2;
      const centerY = height / 2;

      const targetPhase = meta.state === "responding" ? 1 : 0;
      const damping = 1 - Math.pow(0.92, delta / 16.7);
      responsePhaseRef.current += (targetPhase - responsePhaseRef.current) * damping;
      const respondingPhase = clamp(responsePhaseRef.current, 0, 1);

      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = alpha(palette.panelStrong, 0.15);
      ctx.fillRect(-centerX, -centerY, width, height);

      drawResonanceBands(ctx, meta, palette, timestamp, 52, respondingPhase);
      drawWaveform(ctx, meta, palette, timestamp, 52, respondingPhase, resolvedTheme);
      drawPulses(ctx, pulsesRef, timestamp, palette, respondingPhase, meta);

      const corePulse = 0.12 + respondingPhase * 0.4 + clamp(meta.sentiment, -1, 1) * 0.08;
      drawToronCore(ctx, palette, corePulse, meta);
      drawResponseOverlay(ctx, palette, timestamp, respondingPhase, 70);

      ctx.restore();
      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [width, height, resolvedTheme]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width, height }}
      aria-label="Toron Visualizer"
    >
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}

export default ToronVisualizer;
