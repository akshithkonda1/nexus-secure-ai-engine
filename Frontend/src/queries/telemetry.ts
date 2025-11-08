import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { TelemetryErrorsResponse, TelemetryUsageResponse } from "@/types/models";

type TelemetryFilters = { range: string; provider?: string };

function buildQuery(path: string, { range, provider }: TelemetryFilters) {
  const params = new URLSearchParams({ range });
  if (provider) {
    params.set("provider", provider);
  }
  return `${path}?${params.toString()}`;
}

export function useTelemetryUsage(filters: TelemetryFilters) {
  return useQuery({
    queryKey: ["telemetry", "usage", filters],
    queryFn: () => apiGet(buildQuery("/api/telemetry/usage", filters), TelemetryUsageResponse),
  });
}

export function useTelemetryErrors(filters: TelemetryFilters) {
  return useQuery({
    queryKey: ["telemetry", "errors", filters],
    queryFn: () => apiGet(buildQuery("/api/telemetry/errors", filters), TelemetryErrorsResponse),
  });
}
