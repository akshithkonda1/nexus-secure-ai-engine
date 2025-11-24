export type ClusterSentiment = "positive" | "neutral" | "negative" | number;

export interface BackendCluster {
  id: string;
  label: string;
  score: number;
  volume: number;
  sentiment?: ClusterSentiment;
  coordinates?: { x: number; y: number };
}

export interface BubblePoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  fill: string;
  score: number;
  volume: number;
  sentiment: string;
}

const sentimentPalette: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#fbbf24",
  negative: "#ef4444",
};

function sentimentToColor(sentiment?: ClusterSentiment) {
  if (typeof sentiment === "number") {
    if (sentiment >= 0.2) return sentimentPalette.positive;
    if (sentiment <= -0.2) return sentimentPalette.negative;
    return sentimentPalette.neutral;
  }

  return sentimentPalette[sentiment ?? "neutral"] ?? "#7c5dff";
}

export function mapClustersToBubbles(clusters: BackendCluster[]): BubblePoint[] {
  if (!clusters.length) return [];

  const angleStep = (2 * Math.PI) / clusters.length;

  return clusters.map((cluster, index) => {
    const radius = 32 + index * 8;
    const angle = angleStep * index;

    const x = cluster.coordinates?.x ?? Math.min(98, Math.abs(Math.cos(angle) * radius) + 2);
    const y = cluster.coordinates?.y ?? Math.min(98, Math.abs(Math.sin(angle) * radius) + 2);

    const fill = sentimentToColor(cluster.sentiment);
    const sentimentLabel = typeof cluster.sentiment === "number" ? cluster.sentiment.toFixed(2) : cluster.sentiment ?? "neutral";

    return {
      id: cluster.id,
      name: cluster.label,
      x,
      y,
      z: Math.max(10, cluster.volume * 6),
      fill,
      score: Number(cluster.score.toFixed(2)),
      volume: cluster.volume,
      sentiment: sentimentLabel,
    };
  });
}
