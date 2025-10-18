import React from 'react';
import { formatRelative } from '../../lib/time';
import IconButton from '../primitives/IconButton';
import TabButton from '../primitives/TabButton';
import type { SessionRow } from '../../state/sessions';

type Props = {
  sessions: SessionRow[];
  archived: SessionRow[];
  deleted: SessionRow[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onDestroy: (id: string) => void;
  onOpenSettings: () => void;
  isDark: boolean;
};

const ChatSidebar: React.FC<Props> = ({
  sessions,
  archived,
  deleted,
  activeSessionId,
  onSelect,
  onNewChat,
  onRename,
  onArchive,
  onRestore,
  onSoftDelete,
  onDestroy,
  onOpenSettings,
  isDark,
}) => {
  const [tab, setTab] = React.useState<'active' | 'archived' | 'deleted'>('active');
  const list = React.useMemo(() => {
    switch (tab) {
      case 'archived':
        return archived;
      case 'deleted':
        return deleted;
      default:
        return sessions;
    }
  }, [archived, deleted, sessions, tab]);

  return (
    <aside className="chatgpt-sidebar" aria-label="Conversations sidebar">
      <div className="chatgpt-sidebar-header">
        <button className="chatgpt-sidebar-new" onClick={onNewChat}>
          + New chat
        </button>
      </div>

      <div className="chatgpt-sidebar-tabs" role="tablist">
        <TabButton
          active={tab === 'active'}
          label={`Active (${sessions.length})`}
          onClick={() => setTab('active')}
        />
        <TabButton
          active={tab === 'archived'}
          label={`Archived (${archived.length})`}
          onClick={() => setTab('archived')}
        />
        <TabButton
          active={tab === 'deleted'}
          label={`Deleted (${deleted.length})`}
          onClick={() => setTab('deleted')}
        />
      </div>

      <ul className="chatgpt-sidebar-list">
        {list.length === 0 ? (
          <li className="chatgpt-sidebar-item" style={{ border: '1px dashed rgba(var(--border),0.4)' }}>
            <div className="chatgpt-sidebar-item-title" style={{ fontWeight: 500 }}>
              No conversations yet.
            </div>
          </li>
        ) : (
          list.map((session) => {
            const isActive = session.id === activeSessionId;
            const status = session.deletedAt
              ? ' • deleted'
              : session.archivedAt
              ? ' • archived'
              : '';
            return (
              <li
                key={session.id}
                className={`chatgpt-sidebar-item ${isActive ? 'is-active' : ''}`}
              >
                <button onClick={() => onSelect(session.id)}>
                  <div className="chatgpt-sidebar-item-title">{session.title || 'Untitled chat'}</div>
                  <div className="chatgpt-sidebar-item-meta">
                    {formatRelative(session.updatedAt)}
                    {status}
                  </div>
                </button>
                <div className="chatgpt-sidebar-actions" aria-label="Session actions">
                  {tab === 'active' && (
                    <>
                      <IconButton label="Rename" onClick={() => onRename(session.id)}>
                        ✎
                      </IconButton>
                      <IconButton label="Archive" onClick={() => onArchive(session.id)}>
                        🗄
                      </IconButton>
                      <IconButton label="Delete" onClick={() => onSoftDelete(session.id)}>
                        🗑
                      </IconButton>
                    </>
                  )}
                  {tab === 'archived' && (
                    <>
                      <IconButton label="Restore" onClick={() => onRestore(session.id)}>
                        ↩
                      </IconButton>
                      <IconButton label="Delete" onClick={() => onSoftDelete(session.id)}>
                        🗑
                      </IconButton>
                    </>
                  )}
                  {tab === 'deleted' && (
                    <>
                      <IconButton label="Restore" onClick={() => onRestore(session.id)}>
                        ↩
                      </IconButton>
                      <IconButton label="Destroy" onClick={() => onDestroy(session.id)}>
                        ✖
                      </IconButton>
                    </>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="chatgpt-sidebar-footer">
        <button onClick={onOpenSettings}>
          {isDark ? '🌙' : '☀️'} Settings
        </button>
        <span>Secured by Nexus</span>
      </div>
    </aside>
  );
};

export default ChatSidebar;
