import { Request, Response } from 'express';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { telemetryAggregator } from '../telemetry/TelemetryAggregator';
import { safeLogger } from '../utils/SafeLogger';
import { workspaceStorage } from '../workspace/WorkspaceStorage';

export class NimsCommandCenterController {
  get(req: Request, res: Response): void {
    const connectors = connectorRegistry.status();
    const telemetry = telemetryAggregator.aggregate();
    const systemState = {
      uptime: process.uptime(),
      status: 'operational',
      toron: { model: 'toron-default', health: 'green' },
      dataTransformers: { status: 'active' },
    };

    safeLogger.logStatus('command-center.get', 200, { connectors: Object.keys(connectors).length });
    res.json({
      systemState,
      connectorStatuses: connectors,
      toronMetrics: telemetry,
      workspaceHealth: { items: workspaceStorage.list().length },
      telemetrySummary: telemetry,
    });
  }
}

export const nimsCommandCenterController = new NimsCommandCenterController();
