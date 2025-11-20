import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class MicrosoftCalendarProvider implements ConnectorProvider {
  id = 'microsoft-calendar';

  verifyToken(token: string): boolean {
    return token.startsWith('mcal');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { events: 0 },
    };
  }
}
