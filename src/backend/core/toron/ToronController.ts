import { Request, Response } from 'express';
import { toronEngine } from './ToronEngine';
import { safeLogger } from '../../utils/SafeLogger';
import { EncryptedPayload } from '../../utils/Encryption';

export class ToronController {
  async process(req: Request, res: Response): Promise<void> {
    const payload = req.body as EncryptedPayload;
    const correlationId = (req.headers['x-correlation-id'] as string) || 'anon';

    const result = toronEngine.processEncryptedRequest({
      encryptedInput: payload,
      correlationId,
    });

    safeLogger.logStatus('toron.response', 200, { correlationId });
    res.json({
      encrypted: result.encryptedResponse,
      diagnostics: result.diagnostics,
      driftFlag: result.driftFlag,
      hallucinationFlag: result.hallucinationFlag,
      modelSwitch: result.modelSwitch,
      metrics: result.metrics,
    });
  }
}

export const toronController = new ToronController();
