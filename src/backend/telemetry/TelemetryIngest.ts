import { toHourlyBucket } from '../utils/TimeBucket';
import { toRegionBucket } from '../utils/RegionBucket';
import { safeLogger } from '../utils/SafeLogger';
import { AggregatedTelemetry, TelemetryMetricInput } from './TelemetryModelMetrics';

export class TelemetryIngest {
  private records: AggregatedTelemetry[] = [];

  ingest(model: string, payload: TelemetryMetricInput, ip?: string): AggregatedTelemetry {
    const timeBucket = toHourlyBucket(payload.timestamp || Date.now());
    const region = payload.region || toRegionBucket(ip);
    const engine = payload.engine || 'toron';

    const record: AggregatedTelemetry = {
      model,
      engine,
      region,
      timeBucket,
      latencyMs: payload.modelLatencyMs,
      thinkingTimeMs: payload.thinkingTimeMs,
      outputTimeMs: payload.outputTimeMs,
      tokensPerSecond: payload.tokensPerSecond,
      driftIndex: payload.driftIndex,
      divergence: payload.divergence,
      errorRate: payload.errorRate,
      retryCount: payload.retryCount,
      activeModels: payload.activeModels,
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
