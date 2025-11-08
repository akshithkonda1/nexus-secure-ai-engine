import {
  AuditEvent,
  DocumentItem,
  Project,
  Session,
  SettingsData,
  Template,
  TelemetryPoint,
} from "@/types/models";

type MessageRecord = {
  id: string;
  role: "system" | "user" | "assistant";
  text: string;
  at: string;
};

type MockDatabase = {
  sessions: Session[];
  projects: Project[];
  audit: AuditEvent[];
  templates: Template[];
  documents: DocumentItem[];
  telemetry: TelemetryPoint[];
  messages: Map<string, MessageRecord[]>;
  settings: SettingsData;
};

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursAgo(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function createProjects(rand: () => number): Project[] {
  const names = [
    "Governance Playbooks",
    "Market Intelligence",
    "Model Assurance",
    "Partner Enablement",
  ];
  return names.map((name, idx) => ({
    id: `project-${idx + 1}`,
    name,
    description: `${name} initiative inside Nexus.ai`,
    updatedAt: hoursAgo(rand() * 72),
    sessionsCount: Math.floor(rand() * 24) + 6,
    activeCount: Math.floor(rand() * 12) + 1,
    activity7d: Array.from({ length: 7 }, (_, day) => ({
      day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(
        new Date(Date.now() - (6 - day) * 24 * 60 * 60 * 1000),
      ),
      value: Math.floor(rand() * 10) + 1,
    })),
  }));
}

function createSessions(rand: () => number, projects: Project[]): [Session[], Map<string, MessageRecord[]>, AuditEvent[]] {
  const providers = ["gpt-4o", "claude-3.5", "mistral-large", "sonnet-3.5"];
  const messages = new Map<string, MessageRecord[]>();
  const audit: AuditEvent[] = [];
  const sessions: Session[] = Array.from({ length: 26 }, (_, index) => {
    const id = `session-${index + 1}`;
    const project = projects[index % projects.length];
    const status: Session["status"] = index % 7 === 0 ? "archived" : index % 5 === 0 ? "draft" : "active";
    const updatedAt = hoursAgo(rand() * 96);
    const session: Session = {
      id,
      title: `${project.name} thread ${index + 1}`,
      preview:
        index % 3 === 0
          ? "Evaluating cross-model consensus alignment across policy updates."
          : "Exploring Spurs-inspired UI refinements for Nexus debates.",
      updatedAt,
      messages: Math.floor(rand() * 60) + 6,
      providers: providers.filter(() => rand() > 0.45).slice(0, 3),
      status,
      projectId: project.id,
      pinned: index < 3,
    };

    const history: MessageRecord[] = [
      {
        id: `${id}-m1`,
        role: "system",
        text: "You are Nexus.ai orchestrating multi-model debates with transparency.",
        at: hoursAgo(rand() * 160),
      },
    ];
    for (let i = 0; i < 6; i++) {
      const role = i % 2 === 0 ? "user" : "assistant";
      history.push({
        id: `${id}-m${i + 2}`,
        role,
        text:
          role === "user"
            ? "How are the guardrails responding to the latest policy?"
            : "Guardrails triggered two warnings. Drafting remediation guidance now.",
        at: hoursAgo(rand() * 140),
      });
    }
    messages.set(id, history);

    audit.push(
      {
        id: `${id}-audit-1`,
        type: "created",
        at: hoursAgo(rand() * 170),
        actor: "you",
        sessionId: id,
        projectId: project.id,
        details: "Session created",
      },
      {
        id: `${id}-audit-2`,
        type: "message",
        at: hoursAgo(rand() * 120),
        actor: "you",
        sessionId: id,
        projectId: project.id,
        details: "Prompt added",
      },
      {
        id: `${id}-audit-3`,
        type: "modelRun",
        at: hoursAgo(rand() * 80),
        actor: "system",
        sessionId: id,
        projectId: project.id,
        details: session.providers.join(", "),
      },
    );

    return session;
  });

  audit.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return [sessions, messages, audit];
}

function createTemplates(rand: () => number): Template[] {
  const categories = ["Compliance", "Evaluation", "Research"];
  const items = [
    "Regulatory Brief",
    "Vendor Risk Review",
    "Competitive Landscape",
    "Model Eval Sprint",
    "Safety Checklist",
  ];
  return items.map((name, index) => ({
    id: `template-${index + 1}`,
    name,
    description: `${name} workflow to jump-start trusted analysis`,
    category: categories[index % categories.length],
    updatedAt: daysAgo(Math.floor(rand() * 15)),
  }));
}

function createDocuments(rand: () => number): DocumentItem[] {
  const items: DocumentItem[] = [];
  for (let i = 1; i <= 8; i++) {
    items.push({
      id: `doc-${i}`,
      name: `Debate Summary ${i}`,
      size: Math.floor(rand() * 1000_000) + 120_000,
      type: i % 3 === 0 ? "application/pdf" : "text/markdown",
      updatedAt: daysAgo(Math.floor(rand() * 10)),
    });
  }
  return items;
}

function createTelemetry(rand: () => number): TelemetryPoint[] {
  const providers = ["gpt-4o", "claude-3.5", "mistral-large"];
  const points: TelemetryPoint[] = [];
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - day));
    providers.forEach((provider) => {
      points.push({
        date: date.toISOString().split("T")[0],
        requests: Math.floor(rand() * 120) + 40,
        tokens: Math.floor(rand() * 40_000) + 10_000,
        latency: parseFloat((rand() * 180 + 420).toFixed(2)),
        failures: Math.floor(rand() * 6),
        provider,
      });
    });
  }
  return points;
}

function defaultSettings(): SettingsData {
  return {
    profile: {
      displayName: "Trust Team",
      email: "trust@nexus.ai",
      avatarUrl: "https://avatars.dicebear.com/api/initials/NT.svg",
    },
    appearance: {
      theme: "system",
    },
    providers: [
      { id: "gpt-4o", name: "OpenAI GPT-4o", enabled: true },
      { id: "claude", name: "Anthropic Claude", enabled: true },
      { id: "mistral", name: "Mistral Large", enabled: false },
    ],
    limits: {
      dailyRequests: 1500,
      maxTokens: 200_000,
    },
  };
}

const rand = mulberry32(42);
const projects = createProjects(rand);
const [sessions, messages, audit] = createSessions(rand, projects);
const templates = createTemplates(rand);
const documents = createDocuments(rand);
const telemetry = createTelemetry(rand);
const settings = defaultSettings();

const db: MockDatabase = {
  sessions,
  projects,
  audit,
  templates,
  documents,
  telemetry,
  messages,
  settings,
};

export function getDb() {
  return db;
}

export function touchSession(id: string, patch: Partial<Session>) {
  const session = db.sessions.find((item) => item.id === id);
  if (!session) {
    return undefined;
  }
  Object.assign(session, patch);
  session.updatedAt = new Date().toISOString();
  return session;
}

export function insertSession(session: Session, history: MessageRecord[]) {
  db.sessions.unshift(session);
  db.messages.set(session.id, history);
  db.audit.unshift({
    id: `${session.id}-audit-new`,
    type: "created",
    at: new Date().toISOString(),
    actor: "you",
    sessionId: session.id,
    projectId: session.projectId ?? undefined,
    details: "Session created",
  });
  return session;
}

export function insertDocument(item: DocumentItem) {
  db.documents.unshift(item);
  return item;
}

export type { MessageRecord };
