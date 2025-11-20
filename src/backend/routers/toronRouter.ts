import { Router } from 'express';
import { toronController } from '../core/toron/ToronController';

export const toronApiRouter = Router();

toronApiRouter.post('/process', (req, res) => toronController.process(req, res));
