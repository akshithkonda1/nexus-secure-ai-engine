import { Router } from 'express';
import { connectorStateController } from '../connectors/ConnectorStateController';

export const connectorsRouter = Router();

connectorsRouter.get('/', (req, res) => connectorStateController.getStatus(req, res));
connectorsRouter.patch('/', (req, res) => connectorStateController.patch(req, res));
