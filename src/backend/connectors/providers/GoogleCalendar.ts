import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class GoogleCalendarProvider implements ConnectorProvider {
  id = 'google-calendar';

  verifyToken(token: string): boolean {
    return token.startsWith('gcal');
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
