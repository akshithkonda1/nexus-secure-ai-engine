import { Router } from 'express';
import { telemetryController } from '../telemetry/TelemetryController';

export const telemetryRouter = Router();

telemetryRouter.get('/', (req, res) => telemetryController.getAggregated(req, res));
telemetryRouter.post('/ingest', (req, res) => telemetryController.ingest(req, res));
