export type SafeLogEntry = {
  timestamp: string;
  hashedIdentifier?: string;
  connectorHealth?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  telemetryAggregates?: Record<string, unknown>;
  statusCode?: number;
  durationMs?: number;
};

export class SafeLogger {
  private disallowedKeys = [
    'userText',
    'rawContent',
    'documentFragment',
    'telemetryPayload',
    'decodedContent',
    'sanitizedContent',
  ];

  safeLog(entry: SafeLogEntry): void {
    this.assertSafe(entry);
    // Replace with concrete logger integration if available
    // eslint-disable-next-line no-console
    console.log('[SAFE_LOG]', JSON.stringify(entry));
  }

  private assertSafe(entry: Record<string, unknown>): void {
    const forbidden = Object.keys(entry).filter((key) => this.disallowedKeys.includes(key));
    if (forbidden.length) {
      throw new Error(`Unsafe log fields detected: ${forbidden.join(', ')}`);
    }
  }
}

export const safeLogger = new SafeLogger();
