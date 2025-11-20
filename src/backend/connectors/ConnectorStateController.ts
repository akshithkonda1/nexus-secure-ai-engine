import { Request, Response } from 'express';
import { connectorRegistry } from './ConnectorRegistry';
import { safeLogger } from '../utils/SafeLogger';

export class ConnectorStateController {
  getStatus(req: Request, res: Response): void {
    const status = connectorRegistry.status();
    res.json({ connectors: status });
  }

  patch(req: Request, res: Response): void {
    const { connectorId, token, action } = req.body as {
      connectorId: string;
      token?: string;
      action: 'connect' | 'disconnect' | 'refresh';
    };
    const provider = connectorRegistry.getProvider(connectorId);
    if (!provider) {
      safeLogger.logError('connector.patch', 'not_found', { connectorId });
      res.status(404).json({ error: 'unknown_connector' });
      return;
    }

    if (action === 'disconnect') {
      safeLogger.logStatus('connector.disconnect', 200, { connectorId });
      res.json({ status: 'disconnected' });
      return;
    }

    if (!token || !provider.verifyToken(token)) {
      safeLogger.logError('connector.patch', 'invalid_token', { connectorId });
      res.status(400).json({ error: 'invalid_token' });
      return;
    }

    safeLogger.logStatus('connector.patch', 200, { connectorId, action });
    res.json({ status: action === 'refresh' ? 'refreshed' : 'connected' });
  }
}

export const connectorStateController = new ConnectorStateController();
