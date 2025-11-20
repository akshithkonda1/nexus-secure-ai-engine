import { AggregatedTelemetry } from './TelemetryModelMetrics';
import { telemetryIngest } from './TelemetryIngest';

export class TelemetryAggregator {
  aggregate(): Record<string, unknown> {
    const records = telemetryIngest.getRecords();
    const grouped: Record<string, AggregatedTelemetry[]> = {};

    records.forEach((rec) => {
      const key = `${rec.model}:${rec.engine}:${rec.region}:${rec.timeBucket}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(rec);
    });

    const summary = Object.entries(grouped).map(([key, group]) => {
      const base = group[0];
      const aggregateValue = (selector: (r: AggregatedTelemetry) => number): number =>
        group.reduce((acc, rec) => acc + selector(rec), 0) / group.length;

      return {
        key,
        model: base.model,
        engine: base.engine,
        region: base.region,
        timeBucket: base.timeBucket,
        latencyMs: aggregateValue((r) => r.latencyMs),
        thinkingTimeMs: aggregateValue((r) => r.thinkingTimeMs),
        outputTimeMs: aggregateValue((r) => r.outputTimeMs),
        tokensPerSecond: aggregateValue((r) => r.tokensPerSecond),
        driftIndex: aggregateValue((r) => r.driftIndex),
        divergence: aggregateValue((r) => r.divergence),
        errorRate: aggregateValue((r) => r.errorRate),
        retryCount: aggregateValue((r) => r.retryCount),
        activeModels: Array.from(new Set(group.flatMap((r) => r.activeModels))),
      };
    });

    return {
      totalSamples: records.length,
      buckets: summary,
    };
  }
}

export const telemetryAggregator = new TelemetryAggregator();
