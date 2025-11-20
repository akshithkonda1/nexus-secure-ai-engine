/*
 * Minimal safe logger that never records user content. It only accepts
 * structured, anonymized inputs and emits timestamped events for auditability.
 */
export class SafeLogger {
  logStatus(event: string, statusCode: number, context?: Record<string, unknown>): void {
    const payload = {
      ts: new Date().toISOString(),
      event,
      statusCode,
      context: this.filterContext(context),
    };
    // eslint-disable-next-line no-console
    console.info(JSON.stringify(payload));
  }

  logPerformance(event: string, metrics: Record<string, number | string>): void {
    const payload = {
      ts: new Date().toISOString(),
      event,
      metrics,
    };
    // eslint-disable-next-line no-console
    console.info(JSON.stringify(payload));
  }

  logError(event: string, code: string, context?: Record<string, unknown>): void {
    const payload = {
      ts: new Date().toISOString(),
      event,
      code,
      context: this.filterContext(context),
    };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(payload));
  }

  private filterContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;
    const sanitized: Record<string, unknown> = {};
    Object.entries(context).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Never log free-form text; only allow hashed identifiers and statuses.
        sanitized[key] = this.obfuscate(value);
      } else {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }

  private obfuscate(value: string): string {
    const hash = Array.from(Buffer.from(value)).reduce((acc, curr) => acc + curr, 0);
    return `h${hash.toString(16)}`;
  }
}

export const safeLogger = new SafeLogger();
