import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class MicrosoftOutlookProvider implements ConnectorProvider {
  id = 'microsoft-outlook';

  verifyToken(token: string): boolean {
    return token.startsWith('outlook');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { emails: 0 },
    };
  }
}
