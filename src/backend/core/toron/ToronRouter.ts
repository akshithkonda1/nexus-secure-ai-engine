import { Router } from 'express';
import { toronController } from './ToronController';

export const toronRouter = Router();

toronRouter.post('/process', (req, res) => toronController.process(req, res));
