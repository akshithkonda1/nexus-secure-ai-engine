import { useEffect, useMemo, useRef } from "react";
import {
  ToronAdaptiveMetadata,
  ToronState,
  clamp,
} from "./engine/types";

interface ToronVisualizerProps {
  metadata: ToronAdaptiveMetadata;
  width?: number;
  height?: number;
}

const stateWaveSpeed: Record<ToronState, number> = {
  idle: 0.5,
  thinking: 1.1,
  processing: 1.5,
  responding: 1.8,
  error: 0.2,
};

const stateResonance: Record<ToronState, number> = {
  idle: 0.3,
  thinking: 0.6,
  processing: 0.8,
  responding: 1,
  error: 0.1,
};

const statePulse: Record<ToronState, number> = {
  idle: 0.1,
  thinking: 0.35,
  processing: 0.5,
  responding: 0.8,
  error: 0.05,
};

const lerp = (start: number, end: number, t: number): number => start + (end - start) * t;

const ToronVisualizer = ({ metadata, width = 440, height = 260 }: ToronVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetsRef = useRef({ ...metadata });
  const interpolatedRef = useRef({ ...metadata });
  const phaseRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    targetsRef.current = { ...metadata };
  }, [metadata]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = interpolatedRef.current;
      const targets = targetsRef.current;
      interpolatedRef.current = {
        ...current,
        confidence: lerp(current.confidence, targets.confidence, 0.12),
        hallucinationRisk: lerp(current.hallucinationRisk, targets.hallucinationRisk, 0.12),
        llmAgreement: lerp(current.llmAgreement, targets.llmAgreement, 0.12),
        sentiment: lerp(current.sentiment, targets.sentiment, 0.12),
        complexity: lerp(current.complexity, targets.complexity, 0.12),
        biasScore: lerp(current.biasScore, targets.biasScore, 0.12),
        state: targets.state,
      };
    }, 60);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return undefined;

    const draw = () => {
      const { width: w, height: h } = ctx.canvas;
      ctx.clearRect(0, 0, w, h);

      const { confidence, hallucinationRisk, llmAgreement, sentiment, complexity, biasScore, state } =
        interpolatedRef.current;

      const speed = stateWaveSpeed[state];
      const resonance = stateResonance[state];
      const pulse = statePulse[state];

      phaseRef.current += 0.02 * speed;

      // Background resonance
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      const sentimentShift = clamp(0.5 + sentiment * 0.5, 0, 1);
      gradient.addColorStop(0, `rgba(${Math.floor(80 + 120 * biasScore)}, ${Math.floor(40 + 120 * sentimentShift)}, 140, 0.25)`);
      gradient.addColorStop(1, `rgba(30, ${Math.floor(120 + 80 * sentimentShift)}, ${Math.floor(120 + 80 * llmAgreement)}, 0.18)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Core resonance circle
      const coreRadius = 22 + resonance * 18 + complexity * 12;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160, ${Math.floor(180 + 60 * sentimentShift)}, ${Math.floor(150 + 80 * llmAgreement)}, 0.25)`;
      ctx.fill();

      // Waveform rings
      const rings = 4;
      for (let i = 0; i < rings; i += 1) {
        const progress = i / rings;
        const radius = coreRadius + 18 + progress * 42;
        const amplitude = 6 + confidence * 8 - hallucinationRisk * 6;
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 90) {
          const wave = Math.sin(angle * (1 + complexity) + phaseRef.current + i) * amplitude;
          const x = w / 2 + Math.cos(angle) * (radius + wave);
          const y = h / 2 + Math.sin(angle) * (radius + wave);
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(120, ${Math.floor(200 * llmAgreement)}, ${Math.floor(200 * (1 - hallucinationRisk))}, ${0.18 + progress * 0.2})`;
        ctx.lineWidth = 1.6 + pulse * 2;
        ctx.stroke();
      }

      // Pulse markers
      const pulses = Math.max(2, Math.floor(4 * pulse + 2));
      for (let p = 0; p < pulses; p += 1) {
        const angle = (Math.PI * 2 * p) / pulses + phaseRef.current * 0.5;
        const radius = coreRadius + 12 + Math.sin(phaseRef.current + p) * 6;
        const x = w / 2 + Math.cos(angle) * radius;
        const y = h / 2 + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.floor(200 * confidence)}, ${Math.floor(140 + 80 * sentimentShift)}, ${Math.floor(200 * llmAgreement)}, 0.45)`;
        ctx.fill();
      }

      animationRef.current = window.requestAnimationFrame(draw);
    };

    animationRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const viewBox = useMemo(() => ({ width, height }), [width, height]);

  return (
    <div className="flex flex-col gap-2">
      <canvas ref={canvasRef} width={viewBox.width} height={viewBox.height} className="w-full rounded-xl bg-black/50 shadow-inner" />
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
        <Metric label="Confidence" value={interpolatedRef.current.confidence} />
        <Metric label="Hallucination" value={interpolatedRef.current.hallucinationRisk} />
        <Metric label="Agreement" value={interpolatedRef.current.llmAgreement} />
        <Metric label="Sentiment" value={clamp((interpolatedRef.current.sentiment + 1) / 2)} />
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => {
  const percent = Math.round(clamp(value) * 100);
  return (
    <div className="flex items-center justify-between rounded-md bg-white/5 px-2 py-1">
      <span>{label}</span>
      <span className="text-[var(--text-primary)]">{percent}%</span>
    </div>
  );
};

export default ToronVisualizer;
