import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { SettingsMutationResponse, SettingsResponse } from "@/types/models";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet("/api/settings", SettingsResponse),
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => apiPost("/api/settings", SettingsMutationResponse, payload),
    onSuccess: (data) => {
      qc.setQueryData(["settings"], data.data);
    },
  });
}
