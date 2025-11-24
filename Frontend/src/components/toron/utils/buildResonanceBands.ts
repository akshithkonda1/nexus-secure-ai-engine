export interface ResonanceBand {
  radius: number;
  thickness: number;
  rotation: number;
  distortion: number;
  color: string;
  direction: 1 | -1;
}

export interface ResonanceConfig {
  count: number;
  baseRadius: number;
  llmAgreement: number; // 0 - 1
  biasScore: number; // 0 - 1
  hallucinationRisk: number; // 0 - 1
  time: number;
  themeColor: string;
  respondingBoost?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function buildResonanceBands({
  count,
  baseRadius,
  llmAgreement,
  biasScore,
  hallucinationRisk,
  time,
  themeColor,
  respondingBoost = 0,
}: ResonanceConfig): ResonanceBand[] {
  const safeAgreement = clamp(llmAgreement, 0, 1);
  const safeBias = clamp(biasScore, 0, 1);
  const safeRisk = clamp(hallucinationRisk, 0, 1);
  const bands: ResonanceBand[] = [];
  const speed = 0.0004 + respondingBoost * 0.0008;
  const outwardPush = respondingBoost * 18 + safeAgreement * 14;

  for (let i = 0; i < count; i += 1) {
    const ringIndex = i + 1;
    const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
    const agreementExpansion = safeAgreement * (8 + ringIndex * 4);
    const distortion = (safeBias + safeRisk) * (2 + ringIndex * 2.2);
    const radius = baseRadius + ringIndex * 18 + agreementExpansion + outwardPush;
    const rotation =
      (time * speed * direction * (0.6 + ringIndex * 0.08)) % (Math.PI * 2);
    const thickness = 4 + safeAgreement * 6 + respondingBoost * 2;

    bands.push({
      radius,
      thickness,
      rotation,
      distortion,
      color: themeColor,
      direction,
    });
  }

  return bands;
}
