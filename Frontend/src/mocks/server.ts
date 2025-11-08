import type { z } from "zod";
import {
  getDb,
  insertDocument,
  insertSession,
  touchSession,
  type MessageRecord,
} from "@/mocks/data";
import {
  CreateDocumentResponse,
  CreateSessionResponse,
  MessagesResponse,
  SessionsResponse,
  UpdateSessionResponse,
} from "@/types/models";

const TOP_SESSIONS = 20;

type MessagesData = z.infer<typeof MessagesResponse>;
type SessionsData = z.infer<typeof SessionsResponse>;
type UpdateSessionData = z.infer<typeof UpdateSessionResponse>;
type CreateSessionData = z.infer<typeof CreateSessionResponse>;
type CreateDocumentData = z.infer<typeof CreateDocumentResponse>;

function baseUrl(url: string) {
  if (typeof window !== "undefined") {
    try {
      return new URL(url, window.location.origin);
    } catch {
      return new URL(url, "http://localhost");
    }
  }
  return new URL(url, "http://localhost");
}

function buildMessagesResponse(messages: MessageRecord[]): MessagesData {
  return { messages };
}

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSessionFromTemplate(templateId?: string): CreateSessionData {
  const db = getDb();
  const now = new Date().toISOString();
  const template = db.templates.find((item) => item.id === templateId);
  const id = randomId("session");
  const session = {
    id,
    title: template ? `${template.name} Session` : "Untitled session",
    preview: template?.description ?? "Kick things off with a trusted Nexus debate.",
    updatedAt: now,
    messages: 0,
    providers: ["gpt-4o", "claude-3.5"],
    status: "active" as const,
    projectId: db.projects[0]?.id ?? null,
    pinned: false,
  };

  const history: MessageRecord[] = [
    {
      id: `${id}-m1`,
      role: "system",
      text: template
        ? `Template ${template.name} initiated. ${template.description}`
        : "New Nexus.ai session ready.",
      at: now,
    },
  ];
  insertSession(session, history);
  return { session };
}

export async function handleMockRequest(method: string, url: string, body?: unknown) {
  if (!url.startsWith("/api/")) {
    return undefined;
  }

  const db = getDb();
  const target = baseUrl(url);
  const path = target.pathname;

  if (method === "GET" && path === "/api/sessions") {
    const list = [...db.sessions]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, TOP_SESSIONS);
    return { sessions: list } satisfies SessionsData;
  }

  if (method === "GET" && path === "/api/audit") {
    return { events: db.audit };
  }

  if (method === "GET" && path === "/api/projects") {
    return { projects: db.projects };
  }

  if (method === "GET" && path.startsWith("/api/sessions/") && path.endsWith("/messages")) {
    const id = path.split("/")[3];
    const messages = db.messages.get(id) ?? [];
    return buildMessagesResponse(messages);
  }

  if (method === "PATCH" && path.startsWith("/api/sessions/")) {
    const id = path.split("/")[3];
    const payload = (body ?? {}) as { title?: string };
    const session = touchSession(id, { title: payload.title ?? "Untitled session" });
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }
    return { session } satisfies UpdateSessionData;
  }

  if (method === "POST" && path === "/api/sessions") {
    const payload = (body ?? {}) as { templateId?: string; title?: string };
    const response = createSessionFromTemplate(payload.templateId);
    if (payload.title) {
      response.session.title = payload.title;
    }
    return response satisfies CreateSessionData;
  }

  if (method === "GET" && path === "/api/templates") {
    return { templates: db.templates };
  }

  if (method === "GET" && path === "/api/docs") {
    return { items: db.documents };
  }

  if (method === "POST" && path === "/api/docs") {
    const payload = (body ?? {}) as { name?: string; size?: number; type?: string };
    const item = insertDocument({
      id: randomId("doc"),
      name: payload.name ?? "Uploaded file",
      size: payload.size ?? 120_000,
      type: payload.type ?? "application/pdf",
      updatedAt: new Date().toISOString(),
    });
    return { item } satisfies CreateDocumentData;
  }

  if (method === "GET" && path.startsWith("/api/telemetry/usage")) {
    const range = target.searchParams.get("range") ?? "7d";
    const provider = target.searchParams.get("provider") ?? undefined;
    const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const points = db.telemetry.filter((point) => {
      const ts = new Date(point.date).getTime();
      const inRange = ts >= cutoff.getTime();
      const matchesProvider = provider ? point.provider === provider : true;
      return inRange && matchesProvider;
    });
    return { range, provider, points };
  }

  if (method === "GET" && path.startsWith("/api/telemetry/errors")) {
    const usage = (await handleMockRequest(method, url.replace("/errors", "/usage"), body)) as {
      points: typeof db.telemetry;
      range: string;
      provider?: string;
    };
    const points = usage.points.map((point) => ({
      date: point.date,
      failures: point.failures,
      rate: point.requests === 0 ? 0 : Number((point.failures / point.requests).toFixed(3)),
      provider: point.provider,
    }));
    return { range: usage.range, provider: usage.provider, points };
  }

  if (method === "GET" && path === "/api/history") {
    const params = target.searchParams;
    const type = params.get("type");
    const from = params.get("from");
    const to = params.get("to");
    const sessionId = params.get("sessionId");
    const projectId = params.get("projectId");
    const events = db.audit.filter((event) => {
      if (type && event.type !== type) return false;
      if (sessionId && event.sessionId !== sessionId) return false;
      if (projectId && event.projectId !== projectId) return false;
      const ts = new Date(event.at).getTime();
      if (from && ts < new Date(from).getTime()) return false;
      if (to && ts > new Date(to).getTime()) return false;
      return true;
    });
    return { events };
  }

  if (method === "GET" && path === "/api/settings") {
    return db.settings;
  }

  if (method === "POST" && path === "/api/settings") {
    const payload = (body ?? {}) as Partial<typeof db.settings>;
    db.settings = {
      ...db.settings,
      ...payload,
      profile: { ...db.settings.profile, ...(payload.profile ?? {}) },
      appearance: { ...db.settings.appearance, ...(payload.appearance ?? {}) },
      providers: payload.providers ?? db.settings.providers,
      limits: { ...db.settings.limits, ...(payload.limits ?? {}) },
    };
    return { success: true, data: db.settings };
  }

  return undefined;
}
