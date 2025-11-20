import { ConnectorMetadata } from '../connectors/ConnectorRegistry';

export interface WorkspaceItem {
  id: string;
  sanitizedText: string;
  tags: string[];
  summary: string;
  insights: string[];
  metadata: Record<string, unknown>;
}

export class WorkspaceStorage {
  private items: WorkspaceItem[] = [];
  private connectorMetadata: Record<string, ConnectorMetadata> = {};

  store(item: Omit<WorkspaceItem, 'id'>): WorkspaceItem {
    const stored: WorkspaceItem = { ...item, id: `ws-${Date.now()}-${this.items.length}` };
    this.items.push(stored);
    return stored;
  }

  list(): WorkspaceItem[] {
    return this.items;
  }

  storeMetadataSnapshot(connectorId: string, metadata: ConnectorMetadata): void {
    this.connectorMetadata[connectorId] = metadata;
  }

  connectors(): Record<string, ConnectorMetadata> {
    return this.connectorMetadata;
  }
}

export const workspaceStorage = new WorkspaceStorage();
