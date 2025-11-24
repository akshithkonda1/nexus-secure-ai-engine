import { useCallback, useEffect, useRef } from "react";

interface LightfieldControls {
  start: () => void;
  stop: () => void;
}

const DEFAULT_COLORS = {
  c1: "rgba(56, 189, 248, 0.85)",
  c2: "rgba(168, 85, 247, 0.85)",
  c3: "rgba(59, 130, 246, 0.85)",
};

const TEMP_CANVAS = typeof document !== "undefined" ? document.createElement("canvas") : null;
const TEMP_CONTEXT = TEMP_CANVAS ? TEMP_CANVAS.getContext("2d") : null;

function normalizeColor(color: string | null | undefined): string {
  if (!color) return "";
  const trimmed = color.trim();
  if (!TEMP_CONTEXT) return trimmed;

  try {
    TEMP_CONTEXT.fillStyle = "#000";
    TEMP_CONTEXT.fillStyle = trimmed;
    return TEMP_CONTEXT.fillStyle;
  } catch (error) {
    console.warn("Lightfield color normalization failed", error);
    return trimmed;
  }
}

function applyAlpha(normalizedColor: string, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  if (normalizedColor.startsWith("rgba(")) {
    const parts = normalizedColor
      .slice(5, -1)
      .split(",")
      .map((value) => value.trim());
    if (parts.length === 4) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${clampedAlpha})`;
    }
    if (parts.length === 3) {
      return `rgba(${parts.join(", ")}, ${clampedAlpha})`;
    }
  }

  if (normalizedColor.startsWith("rgb(")) {
    const parts = normalizedColor
      .slice(4, -1)
      .split(",")
      .map((value) => value.trim());
    if (parts.length === 3) {
      return `rgba(${parts.join(", ")}, ${clampedAlpha})`;
    }
  }

  if (normalizedColor.startsWith("#")) {
    const hex = normalizedColor.replace("#", "");
    const isShort = hex.length === 3 || hex.length === 4;
    const fullHex = isShort
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

    if (fullHex.length === 6 || fullHex.length === 8) {
      const r = parseInt(fullHex.slice(0, 2), 16);
      const g = parseInt(fullHex.slice(2, 4), 16);
      const b = parseInt(fullHex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
    }
  }

  return normalizedColor;
}

export function useLightfield(
  canvasRef: React.RefObject<HTMLCanvasElement>,
): LightfieldControls {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const startTimeRef = useRef(0);
  const pulseDurationRef = useRef(9000);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const paletteRef = useRef({ ...DEFAULT_COLORS });

  const readStyles = useCallback(() => {
    if (typeof document === "undefined") return;
    const styles = getComputedStyle(document.documentElement);

    const durationCandidate =
      parseFloat(styles.getPropertyValue("--toron-pulse-duration")) ||
      parseFloat(styles.getPropertyValue("--pulse-duration"));
    if (Number.isFinite(durationCandidate) && durationCandidate > 0) {
      pulseDurationRef.current = durationCandidate;
    }

    const c1 = normalizeColor(styles.getPropertyValue("--toron-core-c1")) || DEFAULT_COLORS.c1;
    const c2 = normalizeColor(styles.getPropertyValue("--toron-core-c2")) || DEFAULT_COLORS.c2;
    const c3 = normalizeColor(styles.getPropertyValue("--toron-core-c3")) || DEFAULT_COLORS.c3;

    paletteRef.current = { c1, c2, c3 };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    dimensionsRef.current = { width: rect.width, height: rect.height };
  }, [canvasRef]);

  const drawFrame = useCallback(
    (timestamp: number) => {
      const ctx = contextRef.current;
      if (!ctx) return;

      const { width, height } = dimensionsRef.current;
      if (width === 0 || height === 0) return;

      const now = timestamp || performance.now();
      const t = ((now - startTimeRef.current) / pulseDurationRef.current) * Math.PI * 2;

      const wave1 = (Math.sin(t) + 1) / 2;
      const wave2 = (Math.sin(t + (2 * Math.PI) / 3) + 1) / 2;
      const wave3 = (Math.sin(t + (4 * Math.PI) / 3) + 1) / 2;

      const centerX = width / 2 + (mouseRef.current.x - 0.5) * width * 0.02;
      const centerY = height / 2 + (mouseRef.current.y - 0.5) * height * 0.02;
      const maxRadius = Math.hypot(width, height) * 0.6;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, applyAlpha(paletteRef.current.c1, 0.55 + wave1 * 0.3));
      gradient.addColorStop(0.45, applyAlpha(paletteRef.current.c2, 0.45 + wave2 * 0.35));
      gradient.addColorStop(1, applyAlpha(paletteRef.current.c3, 0.35 + wave3 * 0.4));

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const shimmerOffset = Math.sin(now / 1200) * width * 0.08;
      ctx.save();
      ctx.globalAlpha = 0.12;
      const shimmer = ctx.createLinearGradient(shimmerOffset, 0, width + shimmerOffset, height);
      shimmer.addColorStop(0, applyAlpha(paletteRef.current.c3, 0.35));
      shimmer.addColorStop(0.5, applyAlpha(paletteRef.current.c1, 0.25));
      shimmer.addColorStop(1, applyAlpha(paletteRef.current.c2, 0.35));
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const bloomRadius = maxRadius * 0.5;
      const bloom = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bloomRadius);
      bloom.addColorStop(0, applyAlpha(paletteRef.current.c1, 0.45));
      bloom.addColorStop(0.7, applyAlpha(paletteRef.current.c2, 0.25));
      bloom.addColorStop(1, applyAlpha(paletteRef.current.c3, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
    [paletteRef],
  );

  const initializeContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const context2d = canvas.getContext("2d", { alpha: true });
    if (!context2d) return false;

    contextRef.current = context2d;
    readStyles();
    resizeCanvas();
    return true;
  }, [canvasRef, readStyles, resizeCanvas]);

  const step = useCallback(
    (timestamp: number) => {
      if (!runningRef.current) return;
      drawFrame(timestamp);
      frameRef.current = requestAnimationFrame(step);
    },
    [drawFrame],
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    const ready = contextRef.current ? true : initializeContext();
    if (!ready) return;

    runningRef.current = true;
    startTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(step);
  }, [initializeContext, step]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    initializeContext();
    const handleMouse = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      mouseRef.current = { x, y };
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      stop();
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
    };
  }, [initializeContext, resizeCanvas, stop]);

  return {
    start,
    stop,
  };
}

export default useLightfield;
