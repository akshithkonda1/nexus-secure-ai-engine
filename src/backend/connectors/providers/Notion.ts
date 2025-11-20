import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class NotionProvider implements ConnectorProvider {
  id = 'notion';

  verifyToken(token: string): boolean {
    return token.startsWith('notion');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { pages: 0, databases: 0 },
    };
  }
}
