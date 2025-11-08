import type { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import {
  AuditResponse,
  CreateSessionResponse,
  MessagesResponse,
  ProjectsResponse,
  SessionsResponse,
  UpdateSessionResponse,
} from "@/types/models";

type SessionsData = z.infer<typeof SessionsResponse>;

type RenamePayload = { id: string; title: string };

type CreateSessionPayload = { templateId?: string; title?: string };

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiGet("/api/sessions", SessionsResponse),
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiGet("/api/projects", ProjectsResponse),
  });
}

export function useAudit() {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () => apiGet("/api/audit", AuditResponse),
  });
}

export function useSessionMessages(id?: string) {
  return useQuery({
    queryKey: ["session", id, "messages"],
    enabled: Boolean(id),
    queryFn: () => apiGet(`/api/sessions/${id}/messages`, MessagesResponse),
  });
}

export function useRenameSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: RenamePayload) =>
      apiPatch(`/api/sessions/${id}`, UpdateSessionResponse, { title }),
    onSuccess: (data) => {
      qc.setQueryData(["sessions"], (current: unknown) => {
        if (!current || typeof current !== "object") return current;
        const payload = current as SessionsData;
        return {
          ...payload,
          sessions: payload.sessions.map((session) =>
            session.id === data.session.id ? data.session : session,
          ),
        } satisfies SessionsData;
      });
      qc.setQueryData(["session", data.session.id, "messages"], (current) => current);
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      apiPost("/api/sessions", CreateSessionResponse, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
