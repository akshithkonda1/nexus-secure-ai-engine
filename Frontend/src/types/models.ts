import { z } from "zod";

export const SessionStatusSchema = z.union([
  z.literal("active"),
  z.literal("archived"),
  z.literal("draft"),
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  preview: z.string().optional(),
  updatedAt: z.string(),
  messages: z.number(),
  providers: z.array(z.string()),
  status: SessionStatusSchema,
  projectId: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
});
export type Session = z.infer<typeof SessionSchema>;

export const AuditEventSchema = z.object({
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
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const ProjectActivityPointSchema = z.object({
  day: z.string(),
  value: z.number(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  updatedAt: z.string(),
  sessionsCount: z.number(),
  activeCount: z.number(),
  activity7d: z.array(ProjectActivityPointSchema).optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant"]),
  text: z.string(),
  at: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  updatedAt: z.string(),
});
export type Template = z.infer<typeof TemplateSchema>;

export const DocumentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  updatedAt: z.string(),
  folder: z.boolean().optional(),
});
export type DocumentItem = z.infer<typeof DocumentItemSchema>;

export const TelemetryPointSchema = z.object({
  date: z.string(),
  requests: z.number(),
  tokens: z.number(),
  latency: z.number(),
  failures: z.number(),
  provider: z.string(),
});
export type TelemetryPoint = z.infer<typeof TelemetryPointSchema>;

export const ProviderToggleSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
});
export type ProviderToggle = z.infer<typeof ProviderToggleSchema>;

export const SettingsDataSchema = z.object({
  profile: z.object({
    displayName: z.string(),
    email: z.string().email(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
  providers: z.array(ProviderToggleSchema),
  limits: z.object({
    dailyRequests: z.number(),
    maxTokens: z.number(),
  }),
});
export type SettingsData = z.infer<typeof SettingsDataSchema>;

export const SessionsResponse = z.object({ sessions: z.array(SessionSchema) });
export const AuditResponse = z.object({ events: z.array(AuditEventSchema) });
export const ProjectsResponse = z.object({ projects: z.array(ProjectSchema) });
export const MessagesResponse = z.object({ messages: z.array(MessageSchema) });
export const TemplatesResponse = z.object({ templates: z.array(TemplateSchema) });
export const DocumentsResponse = z.object({ items: z.array(DocumentItemSchema) });
export const TelemetryUsageResponse = z.object({
  range: z.string(),
  provider: z.string().optional(),
  points: z.array(TelemetryPointSchema),
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
export const SettingsResponse = SettingsDataSchema;
export const SettingsMutationResponse = z.object({ success: z.boolean(), data: SettingsDataSchema });

export const CreateSessionResponse = z.object({ session: SessionSchema });
export const UpdateSessionResponse = z.object({ session: SessionSchema });
export const CreateDocumentResponse = z.object({ item: DocumentItemSchema });
