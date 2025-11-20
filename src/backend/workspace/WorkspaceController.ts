import { Request, Response } from 'express';
import { workspaceStorage } from './WorkspaceStorage';
import { workspaceIndexing } from './WorkspaceIndexing';
import { safeLogger } from '../utils/SafeLogger';

export class WorkspaceController {
  get(req: Request, res: Response): void {
    const items = workspaceStorage.list();
    res.json({ items });
  }

  post(req: Request, res: Response): void {
    const { sanitizedText, metadata } = req.body as { sanitizedText: string; metadata?: Record<string, unknown> };
    if (!sanitizedText) {
      res.status(400).json({ error: 'missing_sanitized_text' });
      return;
    }
    const item = workspaceIndexing.buildWorkspaceItem(sanitizedText, metadata || {});
    const stored = workspaceStorage.store(item);
    safeLogger.logStatus('workspace.store', 201, { id: stored.id });
    res.status(201).json({ item: stored });
  }
}

export const workspaceController = new WorkspaceController();
