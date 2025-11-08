import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { AuditResponse } from "@/types/models";

type HistoryFilters = {
  type?: string;
  from?: string;
  to?: string;
  sessionId?: string;
  projectId?: string;
};

function buildQuery(filters: HistoryFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const suffix = params.toString();
  return suffix ? `/api/history?${suffix}` : "/api/history";
}

export function useHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ["history", filters],
    queryFn: () => apiGet(buildQuery(filters), AuditResponse),
  });
}
