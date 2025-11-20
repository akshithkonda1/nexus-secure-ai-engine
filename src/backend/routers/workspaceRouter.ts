import { Router } from 'express';
import { workspaceController } from '../workspace/WorkspaceController';

export const workspaceRouter = Router();

workspaceRouter.get('/', (req, res) => workspaceController.get(req, res));
workspaceRouter.post('/', (req, res) => workspaceController.post(req, res));
