import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class GoogleDriveProvider implements ConnectorProvider {
  id = 'google-drive';

  verifyToken(token: string): boolean {
    return token.startsWith('gdrive');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { docs: 0, sheets: 0, slides: 0 },
    };
  }
}
