import { RyuzenPIIRemovalPipeline, SanitizationInput, SanitizationOutput } from './RyuzenPIIRemovalPipeline';
import { HashingService } from './HashingService';

export interface SanitizationContext {
  source: 'toron' | 'workspace' | 'connector' | 'telemetry' | 'log';
  metadata?: Record<string, unknown>;
  ip?: string;
  timestamp?: Date;
}

export class SanitizationController {
  private readonly pipeline: RyuzenPIIRemovalPipeline;
  private readonly hashing: HashingService;

  constructor(pipeline?: RyuzenPIIRemovalPipeline, hashing?: HashingService) {
    this.hashing = hashing ?? new HashingService();
    this.pipeline = pipeline ?? new RyuzenPIIRemovalPipeline(this.hashing);
  }

  sanitizeForToron(input: SanitizationInput): SanitizationOutput {
    return this.pipeline.execute(input);
  }

  sanitizeWorkspacePayload(text: string, metadata?: Record<string, unknown>): SanitizationOutput {
    return this.pipeline.execute({ text, metadata });
  }

  sanitizeConnectorPayload(metadata: Record<string, unknown>): SanitizationOutput {
    return this.pipeline.execute({ text: '', metadata });
  }

  sanitizeTelemetry(metadata: Record<string, unknown>, ip?: string, timestamp?: Date): SanitizationOutput {
    const timestampBucket = this.hashing.bucketTimestamp(timestamp ?? new Date());
    const ipBucket = ip ? this.hashing.bucketIp(ip) : 'unknown-region';
    const hashedIds = [this.hashing.hashIdentifier(ipBucket + timestampBucket)];
    return {
      sanitizedText: '',
      sanitizedMetadata: { bucket: timestampBucket, region: ipBucket },
      metadataReport: { cleanedMetadata: {}, removedFields: [] },
      hashedIdentifiers: hashedIds,
    };
  }

  sanitizeLoggableMetadata(metadata: Record<string, unknown>): SanitizationOutput {
    return this.pipeline.execute({ text: '', metadata });
  }
}

export const sanitizationController = new SanitizationController();
