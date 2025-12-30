/**
 * Connectors Content Component
 * Complete connector management with 34 platform integrations
 * Ryuzen Workspace Cognitive OS
 */

import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  Key,
  X,
  Check,
  Power,
  PowerOff,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { ConnectorType } from '../../../types/workspace';
import { encryptToken, validateToken, isPlaceholderToken } from '../../../utils/crypto';
import { sanitizeInput } from '../../../utils/sanitize';

type ConnectorsContentProps = {
  className?: string;
};

// Available Connectors - 34 Total
const AVAILABLE_CONNECTORS: {
  type: ConnectorType;
  name: string;
  requiresPAT: boolean;
  category: string;
}[] = [
  // Development & Version Control (3)
  { type: 'github', name: 'GitHub', requiresPAT: false, category: 'Development' },
  { type: 'gitlab', name: 'GitLab', requiresPAT: false, category: 'Development' },
  { type: 'bitbucket', name: 'Bitbucket', requiresPAT: false, category: 'Development' },

  // Project Management (6)
  { type: 'linear', name: 'Linear', requiresPAT: false, category: 'Project Management' },
  { type: 'jira', name: 'Jira', requiresPAT: false, category: 'Project Management' },
  { type: 'asana', name: 'Asana', requiresPAT: false, category: 'Project Management' },
  { type: 'trello', name: 'Trello', requiresPAT: false, category: 'Project Management' },
  { type: 'monday', name: 'Monday.com', requiresPAT: false, category: 'Project Management' },
  { type: 'clickup', name: 'ClickUp', requiresPAT: false, category: 'Project Management' },

  // Documentation & Knowledge (2)
  { type: 'notion', name: 'Notion', requiresPAT: false, category: 'Documentation' },
  { type: 'airtable', name: 'Airtable', requiresPAT: false, category: 'Documentation' },

  // Communication (5)
  { type: 'slack', name: 'Slack', requiresPAT: false, category: 'Communication' },
  { type: 'teams', name: 'Microsoft Teams', requiresPAT: false, category: 'Communication' },
  { type: 'discord', name: 'Discord', requiresPAT: false, category: 'Communication' },
  { type: 'telegram', name: 'Telegram', requiresPAT: true, category: 'Communication' },
  { type: 'zoom', name: 'Zoom', requiresPAT: false, category: 'Communication' },

  // Design (1)
  { type: 'figma', name: 'Figma', requiresPAT: false, category: 'Design' },

  // Cloud Storage (4)
  { type: 'gdrive', name: 'Google Drive', requiresPAT: false, category: 'Storage' },
  { type: 'dropbox', name: 'Dropbox', requiresPAT: false, category: 'Storage' },
  { type: 'box', name: 'Box', requiresPAT: false, category: 'Storage' },
  { type: 'onedrive', name: 'OneDrive', requiresPAT: false, category: 'Storage' },

  // Social & Identity (5)
  { type: 'google', name: 'Google', requiresPAT: false, category: 'Social' },
  { type: 'apple', name: 'Apple', requiresPAT: false, category: 'Social' },
  { type: 'microsoft', name: 'Microsoft', requiresPAT: false, category: 'Social' },
  { type: 'facebook', name: 'Facebook', requiresPAT: false, category: 'Social' },
  { type: 'twitter', name: 'Twitter/X', requiresPAT: false, category: 'Social' },

  // CRM & Sales (2)
  { type: 'hubspot', name: 'HubSpot', requiresPAT: false, category: 'CRM' },
  { type: 'salesforce', name: 'Salesforce', requiresPAT: false, category: 'CRM' },

  // Commerce & Payments (2)
  { type: 'stripe', name: 'Stripe', requiresPAT: false, category: 'Commerce' },
  { type: 'shopify', name: 'Shopify', requiresPAT: false, category: 'Commerce' },

  // Cloud Infrastructure (3)
  { type: 'aws', name: 'Amazon Web Services', requiresPAT: true, category: 'Cloud' },
  { type: 'gcp', name: 'Google Cloud Platform', requiresPAT: false, category: 'Cloud' },
  { type: 'azure', name: 'Microsoft Azure', requiresPAT: false, category: 'Cloud' },

  // Education (1)
  { type: 'canvas', name: 'Canvas LMS', requiresPAT: true, category: 'Education' },
];

// Category order for display
const CATEGORY_ORDER = [
  'Development',
  'Project Management',
  'Documentation',
  'Communication',
  'Design',
  'Storage',
  'Social',
  'CRM',
  'Commerce',
  'Cloud',
  'Education',
];

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  Development: '🔧',
  'Project Management': '📋',
  Documentation: '📚',
  Communication: '💬',
  Design: '🎨',
  Storage: '💾',
  Social: '👤',
  CRM: '🤝',
  Commerce: '💳',
  Cloud: '☁️',
  Education: '🎓',
};

export default function ConnectorsContent({ className }: ConnectorsContentProps) {
  // Workspace state
  const connectors = useWorkspace((state) => state.connectors);
  const addConnector = useWorkspace((state) => state.addConnector);
  const removeConnector = useWorkspace((state) => state.removeConnector);
  const updateConnectorPAT = useWorkspace((state) => state.updateConnectorPAT);
  const toggleConnector = useWorkspace((state) => state.toggleConnector);
  const syncConnector = useWorkspace((state) => state.syncConnector);

  // Local UI state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPATDialog, setShowPATDialog] = useState(false);
  const [selectedConnectorForPAT, setSelectedConnectorForPAT] = useState<string | null>(null);
  const [patInput, setPATInput] = useState('');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isManagingPAT, setIsManagingPAT] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Filter out already added connectors
  const existingTypes = new Set(connectors.map((c) => c.type));
  const availableToAdd = AVAILABLE_CONNECTORS.filter((c) => !existingTypes.has(c.type));

  // Group available connectors by category
  const groupedConnectors = availableToAdd.reduce(
    (acc, connector) => {
      if (!acc[connector.category]) {
        acc[connector.category] = [];
      }
      acc[connector.category].push(connector);
      return acc;
    },
    {} as Record<string, typeof availableToAdd>
  );

  const connectedCount = connectors.filter((c) => c.connected).length;

  // Helper functions
  const getStatus = (connector: (typeof connectors)[0]) => {
    if (!connector.connected) return 'Disconnected';
    if (!connector.lastSync) return 'Idle';
    const lastSyncDate =
      connector.lastSync instanceof Date ? connector.lastSync : new Date(connector.lastSync);
    const minutesSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60);
    if (minutesSinceSync < 5) return 'Syncing';
    return 'Healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-500';
      case 'Syncing':
        return 'bg-blue-500 animate-pulse';
      case 'Disconnected':
        return 'bg-gray-400';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-600 dark:text-green-400';
      case 'Syncing':
        return 'text-blue-600 dark:text-blue-400';
      case 'Disconnected':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  // Event handlers
  const handleAddConnector = (
    type: ConnectorType,
    name: string,
    requiresPAT: boolean,
    category: string
  ) => {
    if (requiresPAT) {
      // Add connector first, then show PAT dialog
      const tempId = `${type}-${Date.now()}`;
      addConnector({
        id: tempId,
        name,
        connected: false,
        type,
        metadata: { category },
      });
      setSelectedConnectorForPAT(tempId);
      setIsManagingPAT(false);
      setShowPATDialog(true);
      setShowAddMenu(false);
    } else {
      // OAuth flow - add and connect directly
      addConnector({
        id: `${type}-${Date.now()}`,
        name,
        connected: true,
        type,
        lastSync: new Date(),
        metadata: { category },
      });
      setShowAddMenu(false);
    }
  };

  const handleSavePAT = () => {
    if (!selectedConnectorForPAT || !patInput.trim()) return;

    const sanitizedToken = sanitizeInput(patInput.trim());

    // Validate token format
    if (!validateToken(sanitizedToken)) {
      setTokenError('Invalid token format. Token must be at least 12 characters and contain only alphanumeric characters, hyphens, underscores, or dots.');
      return;
    }

    // Warn about placeholder tokens
    if (isPlaceholderToken(sanitizedToken)) {
      setTokenError('This looks like a placeholder token. Please enter your actual access token.');
      return;
    }

    // Encrypt token before storing
    const encryptedToken = encryptToken(sanitizedToken);

    if (!encryptedToken) {
      setTokenError('Failed to secure token. Please try again.');
      return;
    }

    updateConnectorPAT(selectedConnectorForPAT, encryptedToken);
    toggleConnector(selectedConnectorForPAT);
    setPATInput('');
    setTokenError(null);
    setShowPATDialog(false);
    setSelectedConnectorForPAT(null);
    setIsManagingPAT(false);
  };

  const handleManagePAT = (connectorId: string) => {
    setSelectedConnectorForPAT(connectorId);
    setIsManagingPAT(true);
    setTokenError(null);
    // Don't prefill - user should enter new token for security
    setPATInput('');
    setShowPATDialog(true);
  };

  const handleRefresh = async (connectorId: string) => {
    setIsSyncing(connectorId);
    syncConnector(connectorId);
    setTimeout(() => setIsSyncing(null), 2000);
  };

  const handleRemove = (connectorId: string, connectorName: string) => {
    if (window.confirm(`Remove ${connectorName}? This will disconnect the integration.`)) {
      removeConnector(connectorId);
    }
  };

  const handleCancelPAT = () => {
    // If we were adding a new connector and cancelled, remove it
    if (selectedConnectorForPAT && !isManagingPAT) {
      const connector = connectors.find((c) => c.id === selectedConnectorForPAT);
      if (connector && !connector.connected && !connector.token) {
        removeConnector(selectedConnectorForPAT);
      }
    }
    setPATInput('');
    setTokenError(null);
    setShowPATDialog(false);
    setSelectedConnectorForPAT(null);
    setIsManagingPAT(false);
  };

  const selectedConnector = connectors.find((c) => c.id === selectedConnectorForPAT);
  const selectedConnectorInfo = selectedConnector
    ? AVAILABLE_CONNECTORS.find((ac) => ac.type === selectedConnector.type)
    : null;

  return (
    <div className={`relative flex h-full flex-col gap-3 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-[var(--text-muted)]">Ecosystems linked</p>
          <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {connectedCount} connected
          </span>
        </div>

        {/* Add Connector Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--accent)]/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showAddMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Categorized Dropdown Menu */}
          {showAddMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />

              {/* Dropdown */}
              <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-72 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl">
                {availableToAdd.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                    All connectors added!
                  </div>
                ) : (
                  CATEGORY_ORDER.filter((cat) => groupedConnectors[cat]).map((category) => (
                    <div key={category} className="border-b border-[var(--border-subtle)] last:border-0">
                      <div className="sticky top-0 bg-[var(--bg-card)] px-3 py-2">
                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                          {CATEGORY_ICONS[category]} {category}
                        </p>
                      </div>
                      {groupedConnectors[category].map((connector) => (
                        <button
                          key={connector.type}
                          type="button"
                          onClick={() =>
                            handleAddConnector(
                              connector.type,
                              connector.name,
                              connector.requiresPAT,
                              connector.category
                            )
                          }
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-[var(--bg-elev)]"
                        >
                          <span className="text-[var(--text)]">{connector.name}</span>
                          {connector.requiresPAT && (
                            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <Key className="h-3 w-3" />
                              Token
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Connector List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {connectors.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-[var(--bg-elev)] p-4">
              <ShieldCheck className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text)]">No connectors yet</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Click "Add" to integrate your tools
            </p>
          </div>
        ) : (
          connectors.map((connector) => {
            const status = getStatus(connector);
            const connectorInfo = AVAILABLE_CONNECTORS.find((ac) => ac.type === connector.type);
            const requiresPAT = connectorInfo?.requiresPAT ?? false;

            return (
              <div
                key={connector.id}
                className="group flex items-center justify-between rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-[var(--bg-elev)]"
              >
                {/* Connector Info */}
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(status)}`} />
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{connector.name}</p>
                    <p className={`text-xs ${getStatusTextColor(status)}`}>{status}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  {/* Refresh - only for connected */}
                  {connector.connected && (
                    <button
                      type="button"
                      onClick={() => handleRefresh(connector.id)}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
                      title="Refresh"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isSyncing === connector.id ? 'animate-spin' : ''}`}
                      />
                    </button>
                  )}

                  {/* Manage PAT - only for PAT connectors */}
                  {requiresPAT && connector.connected && (
                    <button
                      type="button"
                      onClick={() => handleManagePAT(connector.id)}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
                      title="Manage Token"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}

                  {/* Connect/Disconnect Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!connector.connected && requiresPAT && !connector.token) {
                        handleManagePAT(connector.id);
                      } else {
                        toggleConnector(connector.id);
                      }
                    }}
                    className={`rounded-lg p-1.5 transition hover:bg-[var(--bg-elev)] ${
                      connector.connected
                        ? 'text-green-500 hover:text-green-600'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                    title={connector.connected ? 'Disconnect' : 'Connect'}
                  >
                    {connector.connected ? (
                      <Power className="h-4 w-4" />
                    ) : (
                      <PowerOff className="h-4 w-4" />
                    )}
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(connector.id, connector.name)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAT Dialog Modal */}
      {showPATDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-[var(--bg-card)] p-6 shadow-2xl">
            {/* Dialog Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--accent)]/10 p-2">
                  <Key className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {isManagingPAT ? 'Update Access Token' : 'Enter Access Token'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedConnector?.name ?? 'Connector'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelPAT}
                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Token Input */}
            <div className="mb-4">
              <label
                htmlFor="pat-input"
                className="mb-2 block text-sm font-medium text-[var(--text)]"
              >
                Personal Access Token
              </label>
              <input
                id="pat-input"
                type="password"
                value={patInput}
                onChange={(e) => {
                  setPATInput(e.target.value);
                  setTokenError(null); // Clear error on input change
                }}
                placeholder={isManagingPAT ? '••••••••••••••••' : 'Enter your token...'}
                className={`w-full rounded-lg border bg-[var(--bg-elev)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
                  tokenError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/20'
                }`}
                autoFocus
              />
              {tokenError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{tokenError}</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mb-6 rounded-lg bg-yellow-500/10 p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Security:</strong> Your token is stored locally and encrypted. Never share
                your access tokens with others.
                {selectedConnectorInfo?.type === 'canvas' && (
                  <>
                    <br />
                    <br />
                    <strong>Canvas:</strong> Generate a token from Settings → New Access Token in
                    your Canvas account.
                  </>
                )}
                {selectedConnectorInfo?.type === 'aws' && (
                  <>
                    <br />
                    <br />
                    <strong>AWS:</strong> Use IAM access keys from your AWS Console. Format:
                    ACCESS_KEY_ID:SECRET_ACCESS_KEY
                  </>
                )}
                {selectedConnectorInfo?.type === 'telegram' && (
                  <>
                    <br />
                    <br />
                    <strong>Telegram:</strong> Get your bot token from @BotFather on Telegram.
                  </>
                )}
              </p>
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelPAT}
                className="flex-1 rounded-lg border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--bg-elev)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePAT}
                disabled={!patInput.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {isManagingPAT ? 'Update Token' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
