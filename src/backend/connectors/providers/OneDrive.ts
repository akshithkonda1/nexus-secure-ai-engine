import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class OneDriveProvider implements ConnectorProvider {
  id = 'one-drive';

  verifyToken(token: string): boolean {
    return token.startsWith('onedrive');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { files: 0 },
    };
  }
}
