import { Router } from 'express';
import { commandCenterRouter } from './commandCenterRouter';
import { connectorsRouter } from './connectorsRouter';
import { telemetryRouter } from './telemetryRouter';
import { workspaceRouter } from './workspaceRouter';
import { toronApiRouter } from './toronRouter';

export const apiRouter = Router();

apiRouter.use('/command-center', commandCenterRouter);
apiRouter.use('/connectors', connectorsRouter);
apiRouter.use('/telemetry', telemetryRouter);
apiRouter.use('/workspace', workspaceRouter);
apiRouter.use('/toron', toronApiRouter);
