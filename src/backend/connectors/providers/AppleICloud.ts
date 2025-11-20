import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class AppleICloudProvider implements ConnectorProvider {
  id = 'apple-icloud';

  verifyToken(token: string): boolean {
    return token.startsWith('icloud');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { files: 0, photos: 0 },
    };
  }
}
