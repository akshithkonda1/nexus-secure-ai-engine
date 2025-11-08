import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { CreateSessionResponse, TemplatesResponse } from "@/types/models";

type UseTemplatePayload = { templateId: string };

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: () => apiGet("/api/templates", TemplatesResponse),
  });
}

export function useTemplateLaunch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UseTemplatePayload) =>
      apiPost("/api/sessions", CreateSessionResponse, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
