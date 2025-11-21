import { toHourlyBucket } from '../utils/TimeBucket';
import { toRegionBucket } from '../utils/RegionBucket';
import { safeLogger } from '../utils/SafeLogger';
import { AggregatedTelemetry, TelemetryMetricInput } from './TelemetryModelMetrics';

export class TelemetryIngest {
  private records: AggregatedTelemetry[] = [];

  private normaliseMetric(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const coerced = Number(value);
    return Number.isFinite(coerced) ? coerced : fallback;
  }

  private normaliseActiveModels(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    return value
      .map((entry) => (typeof entry === 'string' ? entry : String(entry)))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  ingest(model: string, payload: TelemetryMetricInput, ip?: string): AggregatedTelemetry {
    const timeBucket = toHourlyBucket(payload.timestamp || Date.now());
    const region = payload.region || toRegionBucket(ip);
    const engine = payload.engine || 'toron';

    const record: AggregatedTelemetry = {
      model,
      engine,
      region,
      timeBucket,
      latencyMs: this.normaliseMetric(payload.modelLatencyMs),
      thinkingTimeMs: this.normaliseMetric(payload.thinkingTimeMs),
      outputTimeMs: this.normaliseMetric(payload.outputTimeMs),
      tokensPerSecond: this.normaliseMetric(payload.tokensPerSecond),
      driftIndex: this.normaliseMetric(payload.driftIndex),
      divergence: this.normaliseMetric(payload.divergence),
      errorRate: this.normaliseMetric(payload.errorRate),
      retryCount: Math.max(0, Math.floor(this.normaliseMetric(payload.retryCount))),
      activeModels: this.normaliseActiveModels(payload.activeModels),
    };

    this.records.push(record);
    safeLogger.logPerformance('telemetry.ingest', { model, region, timeBucket });
    return record;
  }

  getRecords(): AggregatedTelemetry[] {
    return this.records;
  }
}

export const telemetryIngest = new TelemetryIngest();
