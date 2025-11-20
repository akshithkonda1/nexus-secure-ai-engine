import { connectorRegistry, ConnectorMetadata } from './ConnectorRegistry';
import { WorkspaceStorage } from '../workspace/WorkspaceStorage';
import { safeLogger } from '../utils/SafeLogger';

export class ConnectorSyncService {
  constructor(private workspace: WorkspaceStorage) {}

  performSync(): Record<string, ConnectorMetadata> {
    const results: Record<string, ConnectorMetadata> = {};
    connectorRegistry.getProviders().forEach((provider) => {
      const metadata = provider.listMetadata();
      this.workspace.storeMetadataSnapshot(provider.id, metadata);
      results[provider.id] = metadata;
    });
    safeLogger.logPerformance('connector.sync', { connectors: Object.keys(results).length });
    return results;
  }
}
