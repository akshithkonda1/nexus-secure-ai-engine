import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Search,
  Pin,
  Play,
  FileText,
  Folder,
  Filter,
  MoreHorizontal,
  Star,
  MessageSquare,
  Archive,
  Activity,
  RefreshCw,
} from "lucide-react";

// ————————————————————————————————————————————
// shadcn/ui primitives (assumed available in the app)
// If your project hasn’t added them yet, either add shadcn/ui
// or replace these with your local components.
// ————————————————————————————————————————————
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Optional: small sparkline for Projects activity
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// ————————————————————————————————————————————
// Types
// ————————————————————————————————————————————
type SessionStatus = "active" | "archived" | "draft";

export type Session = {
  id: string;
  title: string;
  preview?: string;
  updatedAt: string; // ISO
  messages: number;
  providers: string[]; // e.g., ["gpt-4o", "claude-3.5"]
  status: SessionStatus;
  projectId?: string | null;
  pinned?: boolean;
};

export type AuditEvent = {
  id: string;
  type:
    | "created"
    | "renamed"
    | "message"
    | "archived"
    | "restored"
    | "deleted"
    | "exported"
    | "modelRun";
  at: string; // ISO
  actor: string; // "you" | "system" | name
  sessionId?: string;
  projectId?: string;
  details?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string; // ISO
  sessionsCount: number;
  activeCount: number;
  activity7d?: { day: string; value: number }[]; // for sparkline
};

// ————————————————————————————————————————————
// Utilities
// ————————————————————————————————————————————
const TOP_N = 20;

function fmtRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

function byUpdatedDesc(a: { updatedAt: string }, b: { updatedAt: string }) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function groupEventsByDate(events: AuditEvent[]) {
  const map = new Map<string, AuditEvent[]>();
  for (const e of events) {
    const key = new Date(e.at).toDateString();
    const arr = map.get(key) || [];
    arr.push(e);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items: items.sort((a,b)=> new Date(b.at).getTime()-new Date(a.at).getTime()) }));
}

// ————————————————————————————————————————————
// Mock data (replace with real data wiring)
// ————————————————————————————————————————————
function makeMock(): { sessions: Session[]; events: AuditEvent[]; projects: Project[] } {
  const providers = ["gpt-4o", "gpt-4.1", "claude-3.5", "mistral-large"]; 
  const projects: Project[] = [
    {
      id: "p1",
      name: "Market Research",
      description: "Competitive scans & pricing notes",
      updatedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      sessionsCount: 14,
      activeCount: 7,
      activity7d: Array.from({ length: 7 }, (_, i) => ({ day: `${i}`, value: Math.floor(Math.random() * 6) })),
    },
    {
      id: "p2",
      name: "Nexus.ai Roadmap",
      description: "Engine + UI/UX explorations",
      updatedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
      sessionsCount: 23,
      activeCount: 12,
      activity7d: Array.from({ length: 7 }, (_, i) => ({ day: `${i}`, value: Math.floor(Math.random() * 8) })),
    },
  ];

  const sessions: Session[] = Array.from({ length: 26 }, (_, i) => {
    const id = `s${i + 1}`;
    const proj = i % 3 === 0 ? "p1" : i % 5 === 0 ? "p2" : null;
    return {
      id,
      title: i % 4 === 0 ? `Research thread ${i + 1}` : `Session ${i + 1}`,
      preview:
        i % 2 === 0
          ? "Consensus draft on multi-model ranking and debate heuristics."
          : "Exploring Spurs-theme UI and session persistence strategies…",
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 72) * 3600_000).toISOString(),
      messages: Math.floor(Math.random() * 60) + 1,
      providers: providers.filter(() => Math.random() > 0.5).slice(0, 3),
      status: (['active','archived','draft'] as SessionStatus[])[Math.floor(Math.random()*3)],
      projectId: proj,
      pinned: Math.random() > 0.8,
    };
  });

  const events: AuditEvent[] = [];
  for (const s of sessions.slice(0, 22)) {
    events.push(
      {
        id: `${s.id}-e1`,
        type: "message",
        at: new Date(new Date(s.updatedAt).getTime() - 15 * 60_000).toISOString(),
        actor: "you",
        sessionId: s.id,
        details: "Sent a prompt",
      },
      {
        id: `${s.id}-e2`,
        type: "modelRun",
        at: new Date(new Date(s.updatedAt).getTime() - 13 * 60_000).toISOString(),
        actor: "system",
        sessionId: s.id,
        details: s.providers.join(", ") + " run",
      }
    );
  }
  return { sessions, events, projects };
}

// ————————————————————————————————————————————
// Data hook (swap for real TanStack Query later)
// ————————————————————————————————————————————
function useSessionsData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(makeMock());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450); // quick skeleton
    return () => clearTimeout(t);
  }, []);

  return { ...data, loading };
}

// ————————————————————————————————————————————
// Small UI helpers
// ————————————————————————————————————————————
function StatusPill({ s }: { s: SessionStatus }) {
  const styles: Record<SessionStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    archived: "bg-zinc-500/10 text-zinc-400 border border-zinc-600/30",
    draft: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };
  return <span className={`px-2.5 py-1 text-xs rounded-full ${styles[s]}`}>{s}</span>;
}

function ProviderBadge({ p }: { p: string }) {
  return <Badge variant="secondary" className="mr-1 mt-1 lowercase">{p}</Badge>;
}

// ————————————————————————————————————————————
// Sections
// ————————————————————————————————————————————
function RecentSessions({ sessions, loading }: { sessions: Session[]; loading: boolean }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const sorted = useMemo(() => [...sessions].sort(byUpdatedDesc), [sessions]);
  const filtered = useMemo(() => {
    const base = sorted.slice(0, TOP_N);
    if (!q) return base;
    return base.filter((s) =>
      [s.title, s.preview].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase())
    );
  }, [sorted, q]);

  return (
    <Card className="bg-zinc-900/40 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Recent Sessions</CardTitle>
          <p className="text-sm text-zinc-400">Most recent first · showing up to {TOP_N}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search recent…"
              className="pl-8 w-56 bg-zinc-900 border-zinc-800"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-zinc-800/40 animate-pulse border border-zinc-800"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No recent sessions match your search." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="group border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/70 transition">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate text-base font-medium">
                        {s.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <StatusPill s={s.status} />
                        {s.pinned && <Star className="h-4 w-4 text-yellow-400" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Updated {fmtRelative(s.updatedAt)}</span>
                      <span>•</span>
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{s.messages}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {s.preview && (
                      <p className="line-clamp-2 text-sm text-zinc-400 mb-2">{s.preview}</p>
                    )}
                    <div className="flex flex-wrap -mt-1">
                      {s.providers.map((p) => (
                        <ProviderBadge key={p} p={p} />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex items-center justify-between">
                    <div className="text-xs text-zinc-500">
                      {s.projectId ? (
                        <div className="flex items-center gap-1">
                          <Folder className="h-3.5 w-3.5" />
                          <span>Project: {s.projectId}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">No project</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1 bg-blue-700 hover:bg-blue-700/90 text-white"
                        onClick={() => navigate(`/chat/${s.id}`)}
                      >
                        <Play className="h-4 w-4" /> Continue
                      </Button>
                      <Button variant="ghost" size="icon" title="More">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AuditTrail({ events, loading }: { events: AuditEvent[]; loading: boolean }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("all");

  const filtered = useMemo(() => {
    const byType = tab === "all" ? events : events.filter((e) => e.type === tab);
    if (!q) return byType;
    return byType.filter((e) => (e.details || "").toLowerCase().includes(q.toLowerCase()));
  }, [events, q, tab]);

  const grouped = useMemo(() => groupEventsByDate(filtered), [filtered]);

  return (
    <Card className="bg-zinc-900/40 border-zinc-800">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Audit Trail</CardTitle>
            <p className="text-sm text-zinc-400">System & user actions across sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search events…"
                className="pl-8 w-56 bg-zinc-900 border-zinc-800"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            {(["all", "created", "renamed", "message", "modelRun", "archived", "restored", "deleted", "exported"]) as const}
              .map((k) => (
                <TabsTrigger key={k} value={k} className="capitalize">
                  {k === "modelRun" ? "model run" : k}
                </TabsTrigger>
              ))}
          </TabsList>
          <TabsContent value={tab} />
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-zinc-800/40 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No events match your filters." />
        ) : (
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-8">
              {grouped.map((g) => (
                <div key={g.label}>
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-3">{g.label}</div>
                  <div className="space-y-2">
                    {g.items.map((e) => (
                      <div key={e.id} className="flex items-start gap-3">
                        <div className="mt-1">
                          {iconForEvent(e.type)}
                        </div>
                        <div className="flex-1 border border-zinc-800 bg-zinc-900/40 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="capitalize text-zinc-200">{labelForEvent(e.type)}</span>
                              <span className="text-zinc-500">·</span>
                              <span className="text-zinc-500">{fmtRelative(e.at)}</span>
                            </div>
                            <div className="text-xs text-zinc-500">{e.actor}</div>
                          </div>
                          {e.details && (
                            <div className="text-sm text-zinc-400 mt-1">{e.details}</div>
                          )}
                          {e.sessionId && (
                            <div className="mt-2 text-xs text-zinc-500">
                              Session: <Link className="text-blue-400 hover:underline" to={`/chat/${e.sessionId}`}>{e.sessionId}</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectsGrid({ projects, loading }: { projects: Project[]; loading: boolean }) {
  return (
    <Card className="bg-zinc-900/40 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl">Projects</CardTitle>
        <p className="text-sm text-zinc-400">Organize sessions by workspace</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-zinc-800/40 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState message="No projects yet. Create one from any session." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} className="border-zinc-800 bg-zinc-900/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium truncate">{p.name}</CardTitle>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {p.activeCount}/{p.sessionsCount} active
                    </Badge>
                  </div>
                  <div className="text-xs text-zinc-500">Updated {fmtRelative(p.updatedAt)}</div>
                </CardHeader>
                <CardContent className="pt-0">
                  {p.description && (
                    <p className="text-sm text-zinc-400 mb-2 line-clamp-2">{p.description}</p>
                  )}
                  {p.activity7d && (
                    <div className="h-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={p.activity7d} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                          <Area type="monotone" dataKey="value" fillOpacity={0.2} fill="#1E40AF" stroke="#1E40AF" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between">
                  <div className="text-xs text-zinc-500 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    <span>7‑day activity</span>
                  </div>
                  <Button asChild size="sm" className="bg-blue-700 hover:bg-blue-700/90">
                    <Link to={`/projects/${p.id}`}>Open</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
      <Folder className="h-8 w-8 text-zinc-600" />
      <p className="mt-3 text-sm text-zinc-400">{message}</p>
    </div>
  );
}

function labelForEvent(t: AuditEvent["type"]) {
  switch (t) {
    case "created":
      return "created";
    case "renamed":
      return "renamed";
    case "message":
      return "message";
    case "modelRun":
      return "model run";
    case "archived":
      return "archived";
    case "restored":
      return "restored";
    case "deleted":
      return "deleted";
    case "exported":
      return "exported";
  }
}

function iconForEvent(t: AuditEvent["type"]) {
  const cls = "h-4 w-4 text-zinc-500";
  switch (t) {
    case "created":
      return <Pin className={cls} />;
    case "renamed":
      return <EditIcon />;
    case "message":
      return <MessageSquare className={cls} />;
    case "modelRun":
      return <Activity className={cls} />;
    case "archived":
      return <Archive className={cls} />;
    case "restored":
      return <RefreshCw className={cls} />;
    case "deleted":
      return <TrashIcon />;
    case "exported":
      return <FileText className={cls} />;
  }
}

function EditIcon() {
  return (
    <svg className="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// ————————————————————————————————————————————
// Page
// ————————————————————————————————————————————
export default function SessionsPage() {
  const { sessions, events, projects, loading } = useSessionsData();

  const sorted = useMemo(() => [...sessions].sort(byUpdatedDesc), [sessions]);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Sessions</h1>
            <p className="text-zinc-400 mt-1">
              Review and resume Nexus.ai sessions. Your latest work is up top; audit logs and
              projects live below. Clean, simple, and fast.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-zinc-700 text-zinc-200">
              <Folder className="h-4 w-4 mr-2" /> New Project
            </Button>
            <Button className="bg-blue-700 hover:bg-blue-700/90">
              <Play className="h-4 w-4 mr-2" /> New Session
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <RecentSessions sessions={sorted} loading={loading} />
          <ProjectsGrid projects={projects} loading={loading} />
          <AuditTrail events={events} loading={loading} />
        </div>
      </div>
    </TooltipProvider>
  );
}

