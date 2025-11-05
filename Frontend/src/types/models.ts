import { z } from "zod";

export const SessionStatus = z.union([
  z.literal("active"),
  z.literal("archived"),
  z.literal("draft"),
]);
export type SessionStatus = z.infer<typeof SessionStatus>;

export const Session = z.object({
  id: z.string(),
  title: z.string(),
  preview: z.string().optional(),
  updatedAt: z.string(),
  messages: z.number(),
  providers: z.array(z.string()),
  status: SessionStatus,
  projectId: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
});
export type Session = z.infer<typeof Session>;

export const AuditEvent = z.object({
  id: z.string(),
  type: z.enum([
    "created",
    "renamed",
    "message",
    "archived",
    "restored",
    "deleted",
    "exported",
    "modelRun",
  ]),
  at: z.string(),
  actor: z.string(),
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
  details: z.string().optional(),
});
export type AuditEvent = z.infer<typeof AuditEvent>;

export const ProjectActivityPoint = z.object({
  day: z.string(),
  value: z.number(),
});

export const Project = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  updatedAt: z.string(),
  sessionsCount: z.number(),
  activeCount: z.number(),
  activity7d: z.array(ProjectActivityPoint).optional(),
});
export type Project = z.infer<typeof Project>;

export const Message = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  text: z.string(),
  at: z.string(),
});
export type Message = z.infer<typeof Message>;

export const Template = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  updatedAt: z.string(),
});
export type Template = z.infer<typeof Template>;

export const DocumentItem = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  updatedAt: z.string(),
  folder: z.boolean().optional(),
});
export type DocumentItem = z.infer<typeof DocumentItem>;

export const TelemetryPoint = z.object({
  date: z.string(),
  requests: z.number(),
  tokens: z.number(),
  latency: z.number(),
  failures: z.number(),
  provider: z.string(),
});
export type TelemetryPoint = z.infer<typeof TelemetryPoint>;

export const ProviderToggle = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
});
export type ProviderToggle = z.infer<typeof ProviderToggle>;

export const SettingsData = z.object({
  profile: z.object({
    displayName: z.string(),
    email: z.string().email(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
  providers: z.array(ProviderToggle),
  limits: z.object({
    dailyRequests: z.number(),
    maxTokens: z.number(),
  }),
});
export type SettingsData = z.infer<typeof SettingsData>;

export const SessionsResponse = z.object({ sessions: z.array(Session) });
export const AuditResponse = z.object({ events: z.array(AuditEvent) });
export const ProjectsResponse = z.object({ projects: z.array(Project) });
export const MessagesResponse = z.object({ messages: z.array(Message) });
export const TemplatesResponse = z.object({ templates: z.array(Template) });
export const DocumentsResponse = z.object({ items: z.array(DocumentItem) });
export const TelemetryUsageResponse = z.object({
  range: z.string(),
  provider: z.string().optional(),
  points: z.array(TelemetryPoint),
});
export const TelemetryErrorsResponse = z.object({
  range: z.string(),
  provider: z.string().optional(),
  points: z.array(
    z.object({
      date: z.string(),
      failures: z.number(),
      rate: z.number(),
      provider: z.string(),
    }),
  ),
});
export const SettingsResponse = SettingsData;
export const SettingsMutationResponse = z.object({ success: z.boolean(), data: SettingsData });

export const CreateSessionResponse = z.object({ session: Session });
export const UpdateSessionResponse = z.object({ session: Session });
export const CreateDocumentResponse = z.object({ item: DocumentItem });
