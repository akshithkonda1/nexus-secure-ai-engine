import React, { Suspense, useEffect, useMemo, useState, useCallback, useTransition } from 'react';
import TopBar from '../components/TopBar';
import ChatList from '../components/chat/ChatList';
import Composer from '../components/chat/Composer';
import { ThemeStyles } from '../components/ThemeStyles';
import ResultCard from '../components/right-rail/ResultCard';
import AnswersCard from '../components/right-rail/AnswersCard';
import AuditTrailCard from '../components/right-rail/AuditTrailCard';
import SecurityCard from '../components/right-rail/SecurityCard';
import ChatSidebar from '../components/sidebar/ChatSidebar';
import { genId } from '../lib/id';
import { priorityTier } from '../lib/priority';
import type { Message } from '../types/chat';
import { SessionService } from '../state/sessions';
import type { SessionRow } from '../state/sessions';
import { useDarkMode } from '../hooks/useDarkMode';
import { readProfile, writeProfile, type UserProfile } from '../state/profile';

const ProfileModal = React.lazy(() => import('../components/modals/ProfileModal'));

// Memoized components to prevent unnecessary re-renders
const MemoizedTopBar = React.memo(TopBar);
const MemoizedChatList = React.memo(ChatList);
const MemoizedComposer = React.memo(Composer);
const MemoizedChatSidebar = React.memo(ChatSidebar);
const MemoizedResultCard = React.memo(ResultCard);
const MemoizedAnswersCard = React.memo(AnswersCard);
const MemoizedAuditTrailCard = React.memo(AuditTrailCard);
const MemoizedSecurityCard = React.memo(SecurityCard);

// Demo orchestration logic extracted for reusability
const runOrchestration = (
  text: string,
  onStart: (models: string[]) => void,
  onComplete: (result: any, answers: any[]) => void
) => {
  const models = ['grok', 'chatgpt', 'claude', 'perplexity'];
  onStart(models);

  setTimeout(() => {
    const answers = models.map((id, i) => ({
      model: id,
      ms: 700 + i * 120 + Math.floor(Math.random() * 300),
      text: `Answer from ${id}: ${text}`,
    }));

    const conf = Math.min(0.98, 0.55 + models.length * 0.08 + 0.06);
    const result = {
      confidence: +conf.toFixed(2),
      votes: answers.map((ans) => ({
        model: ans.model,
        agrees: true,
        score: +conf.toFixed(2),
      })),
      explanations: ['Cross-checked claims.', 'Applied consensus threshold.'],
    };

    onComplete(result, answers);
  }, 600);
};

// Extract consensus logic
const getConsensusText = (answers: any[]): string => {
  const normalized = answers.map((x) =>
    x.text.replace(/^Answer from [^:]+:\s*/, '').trim()
  );
  const freq = new Map<string, { count: number; idxs: number[] }>();

  normalized.forEach((t, i) => {
    const k = t.toLowerCase();
    const v = freq.get(k) || { count: 0, idxs: [] };
    v.count++;
    v.idxs.push(i);
    freq.set(k, v);
  });

  let bestKey: string | null = null;
  let bestCount = 0;
  for (const [k, v] of freq.entries()) {
    if (v.count > bestCount) {
      bestCount = v.count;
      bestKey = k;
    }
  }

  let bestIdx = 0;
  if (bestKey !== null) {
    const c = freq.get(bestKey)!.idxs;
    bestIdx = c[0];
  }

  return normalized[bestIdx] || normalized[0] || '';
};

const ChatPage: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { isDark, setIsDark } = useDarkMode();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => readProfile());
  const [isPending, startTransition] = useTransition();

  // Session management
  const [sessions, setSessions] = useState<SessionRow[]>(() => SessionService.list());
  const [archived, setArchived] = useState<SessionRow[]>(() => SessionService.listArchived());
  const [deleted, setDeleted] = useState<SessionRow[]>(() => SessionService.listDeleted());

  const refreshSessions = useCallback(() => {
    setSessions(SessionService.list());
    setArchived(SessionService.listArchived());
    setDeleted(SessionService.listDeleted());
  }, []);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => sessions[0]?.id || null
  );

  const allSessions = useMemo<SessionRow[]>(
    () => [...sessions, ...archived, ...deleted],
    [sessions, archived, deleted]
  );

  const activeSession = useMemo(
    () => allSessions.find((s) => s.id === activeSessionId) || null,
    [allSessions, activeSessionId]
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    activeSessionId ? SessionService.messages(activeSessionId) : []
  );

  // Demo state
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [answers, setAnswers] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [uiSessionId] = useState(() => genId().slice(0, 8));

  // Memoized callbacks
  const log = useCallback((action: string, meta: any = {}) => {
    setEvents((a) => [{ ts: Date.now(), action, meta }, ...a].slice(0, 120));
  }, []);

  const send = useCallback(
    (text: string) => {
      let sid = activeSessionId;

      // Create new session if needed
      if (!sid) {
        const s = SessionService.create('New chat');
        refreshSessions();
        sid = s.id;
        setActiveSessionId(s.id);
      }

      if (!sid) return;

      // Add user message
      const userMsg: Message = {
        id: genId(),
        role: 'user',
        text,
        ts: Date.now(),
      };
      const next = [...messages, userMsg];
      setMessages(next);
      SessionService.saveMessages(sid, next);

      // Start orchestration
      setRunning(true);
      setResult(null);
      setAnswers(null);

      runOrchestration(
        text,
        (models) => log('orchestrate.start', { models }),
        (res, ans) => {
          setResult(res);
          setAnswers(ans);
          setRunning(false);
          log('orchestrate.finish', {
            confidence: res.confidence,
            models: res.votes.length,
          });

          // Generate consensus response
          const overall = getConsensusText(ans);
          const meta = `Consensus ${Math.round(res.confidence * 100)}% • ${
            res.votes.length
          } models • tier: ${priorityTier(res.votes.length)}`;

          const assistantMsg: Message = {
            id: genId(),
            role: 'assistant',
            text: overall,
            meta,
            ts: Date.now(),
          };

          const final = [...next, assistantMsg];
          setMessages(final);
          SessionService.saveMessages(sid!, final);
        }
      );
    },
    [activeSessionId, messages, refreshSessions, log]
  );

  const handleProfileChange = useCallback((next: UserProfile) => {
    setProfile(next);
    writeProfile(next);
  }, []);

  const handleNewChat = useCallback(() => {
    const s = SessionService.create('New chat');
    refreshSessions();
    setActiveSessionId(s.id);
  }, [refreshSessions]);

  const handleRename = useCallback(
    (id: string) => {
      const cur = allSessions.find((s) => s.id === id);
      const t = prompt('Rename session', cur?.title || '');
      if (t && t.trim()) {
        SessionService.update(id, { title: t.trim() });
        refreshSessions();
      }
    },
    [allSessions, refreshSessions]
  );

  const handleArchive = useCallback(
    (id: string) => {
      SessionService.archive(id);
      refreshSessions();
      if (id === activeSessionId) {
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
      }
    },
    [activeSessionId, refreshSessions]
  );

  const handleRestore = useCallback(
    (id: string) => {
      SessionService.restore(id);
      refreshSessions();
      setActiveSessionId(id);
    },
    [refreshSessions]
  );

  const handleSoftDelete = useCallback(
    (id: string) => {
      SessionService.softDelete(id);
      refreshSessions();
      if (id === activeSessionId) {
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
      }
    },
    [activeSessionId, refreshSessions]
  );

  const handleDestroy = useCallback(
    (id: string) => {
      if (!confirm('Permanently destroy this session?')) return;
      SessionService.remove(id);
      refreshSessions();
      if (id === activeSessionId) {
        setActiveSessionId(SessionService.list()?.[0]?.id || null);
      }
    },
    [activeSessionId, refreshSessions]
  );

  // Load messages when active session changes
  useEffect(() => {
    setMessages(activeSessionId ? SessionService.messages(activeSessionId) : []);
  }, [activeSessionId]);

  // Ensure at least one session exists
  useEffect(() => {
    if (
      (sessions?.length ?? 0) === 0 &&
      (archived?.length ?? 0) === 0 &&
      (deleted?.length ?? 0) === 0
    ) {
      const s = SessionService.create('New chat');
      refreshSessions();
      setActiveSessionId(s.id);
    }
  }, [sessions, archived, deleted, refreshSessions]);

  // Validate active session still exists
  useEffect(() => {
    const exists = allSessions.some((s) => s.id === activeSessionId);
    if (!exists) {
      const fb = (sessions?.[0] || archived?.[0] || deleted?.[0] || null) as any;
      setActiveSessionId(fb ? fb.id : null);
    }
  }, [allSessions, sessions, archived, deleted, activeSessionId]);

  return (
    <div className="chatgpt-app">
      <ThemeStyles />
      <div className="chatgpt-shell">
        <MemoizedChatSidebar
          sessions={sessions}
          archived={archived}
          deleted={deleted}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onNewChat={handleNewChat}
          onRename={handleRename}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onSoftDelete={handleSoftDelete}
          onDestroy={handleDestroy}
          onOpenSettings={onOpenSettings}
          isDark={isDark}
        />
        <main className="chatgpt-main">
          <MemoizedTopBar
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            onOpenProfile={() => setProfileOpen(true)}
            profileAvatar={profile.avatarDataUrl}
          />
          <MemoizedChatList messages={messages} />
          <div className="chatgpt-composer-area">
            <MemoizedComposer onSend={send} disabled={running} />
            <p className="chatgpt-composer-hint">
              Nexus is an experimental AI platform—responses are verified but not
              guaranteed to be accurate or final.
            </p>
          </div>
        </main>
        <aside className="chatgpt-right-rail">
          <MemoizedResultCard running={running} result={result} />
          <MemoizedAnswersCard running={running} answers={answers} />
          <MemoizedAuditTrailCard events={events} />
          <MemoizedSecurityCard redactPII={true} uiSessionId={uiSessionId} />
        </aside>
      </div>
      <Suspense fallback={null}>
        {profileOpen && (
          <ProfileModal
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            profile={profile}
            onProfileChange={handleProfileChange}
            onDeleteAccount={(feedback) => {
              console.info('Account deletion requested', { feedback });
              setProfileOpen(false);
            }}
            onUpgradePlan={() => {
              alert('Upgrade workflow coming soon! Our team has been notified.');
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ChatPage;
