export type PulseKind = "ascending" | "forward" | "bloom" | "tight";

export interface Pulse {
  id: string;
  kind: PulseKind;
  createdAt: number;
  duration: number;
  intensity: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const classifyMessage = (message: string): PulseKind => {
  const normalized = message.toLowerCase();
  if (/\?/.test(normalized) || /who|what|when|where|why|how/.test(normalized)) {
    return "ascending";
  }
  if (/please|run |execute|start|stop|deploy|schedule/.test(normalized)) {
    return "forward";
  }
  if (/sorry|love|feel|happy|sad|excited|frustrated/.test(normalized)) {
    return "bloom";
  }
  if (/api|stack|code|bug|error|trace|compile|refactor/.test(normalized)) {
    return "tight";
  }
  return "ascending";
};

export function buildPulse(message: string, now: number, metadataIntensity: number): Pulse {
  const kind = classifyMessage(message);
  const baseIntensity = clamp(metadataIntensity, 0, 1);
  const duration = 1200;
  return {
    id: `${kind}-${now}`,
    kind,
    createdAt: now,
    duration,
    intensity: baseIntensity,
  };
}

export function pulseProgress(pulse: Pulse, now: number): number {
  return clamp((now - pulse.createdAt) / pulse.duration, 0, 1);
}
