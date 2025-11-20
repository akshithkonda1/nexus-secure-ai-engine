import { ConnectorMetadata, ConnectorProvider } from '../ConnectorRegistry';

export class GitHubProvider implements ConnectorProvider {
  id = 'github';

  verifyToken(token: string): boolean {
    return token.startsWith('ghp_');
  }

  listMetadata(): ConnectorMetadata {
    return {
      fileCount: 0,
      folderCount: 0,
      lastSync: null,
      health: 'disconnected',
      itemTypes: { repos: 0, issues: 0 },
    };
  }
}
