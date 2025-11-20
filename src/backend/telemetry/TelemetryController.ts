import { Request, Response } from 'express';
import { telemetryIngest } from './TelemetryIngest';
import { telemetryAggregator } from './TelemetryAggregator';
import { safeLogger } from '../utils/SafeLogger';

export class TelemetryController {
  ingest(req: Request, res: Response): void {
    const { model, metrics } = req.body as { model: string; metrics: any };
    if (!model || !metrics) {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }
    telemetryIngest.ingest(model, metrics, req.ip);
    safeLogger.logStatus('telemetry.ingest', 200, { model });
    res.status(201).json({ status: 'accepted' });
  }

  getAggregated(req: Request, res: Response): void {
    const aggregated = telemetryAggregator.aggregate();
    res.json(aggregated);
  }
}

export const telemetryController = new TelemetryController();
