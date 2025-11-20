import { Router } from 'express';
import { nimsCommandCenterController } from '../commandCenter/NimsCommandCenterController';

export const commandCenterRouter = Router();

commandCenterRouter.get('/', (req, res) => nimsCommandCenterController.get(req, res));
