/**
 * Calendar Sync Settings Component
 * Manage Google, Microsoft, and Apple calendar connections
 */

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  Calendar,
  Settings,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  CalendarSyncService,
  type CalendarConnection,
  type CalendarProvider,
  type ExternalCalendar,
} from '../../../services/calendar/calendarSync';

type CalendarSyncSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
  onSync?: (events: any[]) => void;
};

// Provider icons as SVG
const ProviderIcon = ({ provider, className = '' }: { provider: CalendarProvider; className?: string }) => {
  switch (provider) {
    case 'google':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      );
    case 'microsoft':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M11.4 11.4H1V1h10.4v10.4z" fill="#F25022"/>
          <path d="M23 11.4H12.6V1H23v10.4z" fill="#7FBA00"/>
          <path d="M11.4 23H1V12.6h10.4V23z" fill="#00A4EF"/>
          <path d="M23 23H12.6V12.6H23V23z" fill="#FFB900"/>
        </svg>
      );
    case 'apple':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      );
  }
};

// Storage key for connections
const STORAGE_KEY = 'ryuzen-calendar-connections';

export default function CalendarSyncSettings({
  isOpen,
  onClose,
  onSync,
}: CalendarSyncSettingsProps) {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState<CalendarProvider | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);

  // Load connections from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Restore Date objects
        const restored = parsed.map((conn: any) => ({
          ...conn,
          expiresAt: conn.expiresAt ? new Date(conn.expiresAt) : undefined,
          lastSync: conn.lastSync ? new Date(conn.lastSync) : undefined,
        }));
        setConnections(restored);
      } catch (e) {
        console.error('Failed to parse stored connections:', e);
      }
    }
  }, []);

  // Save connections to storage
  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    }
  }, [connections]);

  // Handle OAuth callback on mount
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const idToken = params.get('id_token');
      const provider = sessionStorage.getItem('oauth_provider') as CalendarProvider;

      if (code && state && provider) {
        setLoading(provider);
        setError(null);

        try {
          const connection = await CalendarSyncService.handleCallback(provider, {
            code,
            state,
            id_token: idToken || undefined,
          });

          setConnections(prev => {
            // Replace existing connection for same provider/email
            const filtered = prev.filter(
              c => !(c.provider === connection.provider && c.email === connection.email)
            );
            return [...filtered, connection];
          });

          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to connect calendar');
        } finally {
          setLoading(null);
        }
      }
    };

    handleCallback();
  }, []);

  const handleConnect = async (provider: CalendarProvider) => {
    setLoading(provider);
    setError(null);

    try {
      await CalendarSyncService.connect(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start connection');
      setLoading(null);
    }
  };

  const handleDisconnect = async (connection: CalendarConnection) => {
    try {
      await CalendarSyncService.disconnect(connection);
      setConnections(prev => prev.filter(c => c.id !== connection.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disconnect');
    }
  };

  const handleSync = async (connection: CalendarConnection) => {
    setSyncing(connection.id);
    setError(null);

    try {
      const enabledCalendars = connection.calendars.filter(c => c.syncEnabled);
      const allEvents: any[] = [];

      const now = new Date();
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const sixMonthsLater = new Date(now);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      for (const calendar of enabledCalendars) {
        const events = await CalendarSyncService.syncEvents(
          connection,
          calendar.id,
          threeMonthsAgo,
          sixMonthsLater
        );
        allEvents.push(...events);
      }

      // Update last sync time
      setConnections(prev =>
        prev.map(c =>
          c.id === connection.id ? { ...c, lastSync: new Date() } : c
        )
      );

      if (onSync) {
        onSync(allEvents);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sync events');
    } finally {
      setSyncing(null);
    }
  };

  const toggleCalendarSync = (connectionId: string, calendarId: string) => {
    setConnections(prev =>
      prev.map(conn =>
        conn.id === connectionId
          ? {
              ...conn,
              calendars: conn.calendars.map(cal =>
                cal.id === calendarId ? { ...cal, syncEnabled: !cal.syncEnabled } : cal
              ),
            }
          : conn
      )
    );
  };

  if (!isOpen) return null;

  const providerInfo = CalendarSyncService.getProviderInfo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-[var(--bg-surface)] border border-[var(--line-subtle)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--line-subtle)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">Calendar Sync</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Connected Accounts */}
          {connections.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Connected Accounts</h3>
              <div className="space-y-2">
                {connections.map((connection) => {
                  const info = providerInfo(connection.provider);
                  const isExpanded = expandedConnection === connection.id;

                  return (
                    <div
                      key={connection.id}
                      className="rounded-xl bg-[var(--bg-elev)]/50 border border-[var(--line-subtle)] overflow-hidden"
                    >
                      {/* Connection Header */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--bg-elev)]/80 transition-colors"
                        onClick={() => setExpandedConnection(isExpanded ? null : connection.id)}
                      >
                        <ProviderIcon provider={connection.provider} className="h-6 w-6 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">
                            {connection.displayName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {connection.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {connection.lastSync && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Synced {formatRelativeTime(connection.lastSync)}
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSync(connection); }}
                            disabled={syncing === connection.id}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent)]"
                            title="Sync now"
                          >
                            {syncing === connection.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          <ChevronRight className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-[var(--line-subtle)] p-3">
                          <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Calendars to sync:</p>
                          <div className="space-y-1.5">
                            {connection.calendars.map((calendar) => (
                              <label
                                key={calendar.id}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={calendar.syncEnabled}
                                  onChange={() => toggleCalendarSync(connection.id, calendar.id)}
                                  className="w-4 h-4 rounded border-[var(--line-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                />
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: calendar.color || '#6366F1' }}
                                />
                                <span className="text-sm text-[var(--text)] truncate flex-1">
                                  {calendar.name}
                                </span>
                                {calendar.primary && (
                                  <span className="text-[10px] text-[var(--accent)] font-medium">Primary</span>
                                )}
                                {calendar.readOnly && (
                                  <span className="text-[10px] text-[var(--text-muted)]">Read-only</span>
                                )}
                              </label>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-[var(--line-subtle)] flex items-center justify-between">
                            <button
                              onClick={() => handleDisconnect(connection)}
                              className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              Disconnect
                            </button>
                            <a
                              href={
                                connection.provider === 'google'
                                  ? 'https://calendar.google.com'
                                  : connection.provider === 'microsoft'
                                  ? 'https://outlook.live.com/calendar'
                                  : 'https://www.icloud.com/calendar'
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                            >
                              Open {info.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add New Connection */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">
              {connections.length > 0 ? 'Add Another Account' : 'Connect a Calendar'}
            </h3>
            <div className="space-y-2">
              {/* Google */}
              <button
                onClick={() => handleConnect('google')}
                disabled={loading === 'google'}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elev)]/30 hover:bg-[var(--bg-elev)]/50 border border-[var(--line-subtle)] transition-colors disabled:opacity-50"
              >
                {loading === 'google' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                ) : (
                  <ProviderIcon provider="google" className="h-6 w-6" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--text)]">Google Calendar</p>
                  <p className="text-xs text-[var(--text-muted)]">Sync with your Google account</p>
                </div>
                <Plus className="h-4 w-4 text-[var(--text-muted)]" />
              </button>

              {/* Microsoft */}
              <button
                onClick={() => handleConnect('microsoft')}
                disabled={loading === 'microsoft'}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elev)]/30 hover:bg-[var(--bg-elev)]/50 border border-[var(--line-subtle)] transition-colors disabled:opacity-50"
              >
                {loading === 'microsoft' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                ) : (
                  <ProviderIcon provider="microsoft" className="h-6 w-6" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--text)]">Outlook / Microsoft 365</p>
                  <p className="text-xs text-[var(--text-muted)]">Sync with your Microsoft account</p>
                </div>
                <Plus className="h-4 w-4 text-[var(--text-muted)]" />
              </button>

              {/* Apple */}
              <button
                onClick={() => handleConnect('apple')}
                disabled={loading === 'apple'}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elev)]/30 hover:bg-[var(--bg-elev)]/50 border border-[var(--line-subtle)] transition-colors disabled:opacity-50"
              >
                {loading === 'apple' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
                ) : (
                  <ProviderIcon provider="apple" className="h-6 w-6" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[var(--text)]">Apple Calendar</p>
                  <p className="text-xs text-[var(--text-muted)]">Sync with iCloud Calendar</p>
                </div>
                <Plus className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-[var(--text-muted)]">
              <strong className="text-blue-400">Privacy:</strong> Your calendar data is synced locally
              and never stored on our servers. OAuth tokens are kept secure in your browser's local storage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--line-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elev)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
