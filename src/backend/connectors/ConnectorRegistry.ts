import { safeLogger } from '../utils/SafeLogger';
import { GoogleDriveProvider } from './providers/GoogleDrive';
import { GoogleCalendarProvider } from './providers/GoogleCalendar';
import { MicrosoftOutlookProvider } from './providers/MicrosoftOutlook';
import { MicrosoftCalendarProvider } from './providers/MicrosoftCalendar';
import { AppleICloudProvider } from './providers/AppleICloud';
import { NotionProvider } from './providers/Notion';
import { GitHubProvider } from './providers/GitHub';
import { OneDriveProvider } from './providers/OneDrive';

export interface ConnectorMetadata {
  fileCount: number;
  folderCount: number;
  lastSync: string | null;
  health: 'healthy' | 'degraded' | 'disconnected';
  itemTypes: Record<string, number>;
}

export interface ConnectorProvider {
  id: string;
  verifyToken(token: string): boolean;
  listMetadata(): ConnectorMetadata;
}

export class ConnectorRegistry {
  private providers: Record<string, ConnectorProvider> = {};

  constructor() {
    this.register(new GoogleDriveProvider());
    this.register(new GoogleCalendarProvider());
    this.register(new MicrosoftOutlookProvider());
    this.register(new MicrosoftCalendarProvider());
    this.register(new AppleICloudProvider());
    this.register(new NotionProvider());
    this.register(new GitHubProvider());
    this.register(new OneDriveProvider());
  }

  register(provider: ConnectorProvider): void {
    this.providers[provider.id] = provider;
  }

  getProviders(): ConnectorProvider[] {
    return Object.values(this.providers);
  }

  getProvider(id: string): ConnectorProvider | undefined {
    return this.providers[id];
  }

  status(): Record<string, ConnectorMetadata> {
    const snapshot: Record<string, ConnectorMetadata> = {};
    Object.values(this.providers).forEach((provider) => {
      snapshot[provider.id] = provider.listMetadata();
    });
    safeLogger.logStatus('connector.registry.snapshot', 200, { total: Object.keys(snapshot).length });
    return snapshot;
  }
}

export const connectorRegistry = new ConnectorRegistry();
