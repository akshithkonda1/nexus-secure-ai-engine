export interface WaveformPoint {
  angle: number;
  radius: number;
}

export interface WaveformConfig {
  amplitude: number; // 0 - 1
  jitter: number; // 0 - 1
  baseRadius: number;
  pointCount?: number;
  time: number;
  respondingBoost?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function buildWaveform({
  amplitude,
  jitter,
  baseRadius,
  pointCount = 360,
  time,
  respondingBoost = 0,
}: WaveformConfig): WaveformPoint[] {
  const safeAmplitude = clamp(amplitude, 0, 1);
  const safeJitter = clamp(jitter, 0, 1);
  const points: WaveformPoint[] = [];
  const speed = 0.002 + respondingBoost * 0.004;
  const jitterStrength = 6 + safeJitter * 18;
  const amplitudeScale = 10 + safeAmplitude * 26 + respondingBoost * 12;

  for (let i = 0; i < pointCount; i += 1) {
    const angle = (i / pointCount) * Math.PI * 2;
    const wave = Math.sin(angle * 4 + time * speed * 2 * Math.PI);
    const micro = Math.sin(angle * 11 + time * speed * 5 * Math.PI);
    const distortion =
      wave * amplitudeScale + micro * jitterStrength * (0.5 + safeJitter * 0.5);
    const radius = baseRadius + distortion;
    points.push({ angle, radius });
  }

  return points;
}
