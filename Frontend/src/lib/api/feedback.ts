import { z } from "zod";

import { apiGet, apiPost } from "@/lib/api";

const unknownShape = z.any();

export type ExportDestination = "local" | "s3" | "bigquery";

export function submitFeedback(payload: Record<string, unknown>) {
  return apiPost("/feedback", unknownShape, payload);
}

export function getAllFeedback() {
  return apiGet("/feedback", unknownShape);
}

export function getAdminSummary() {
  return apiGet("/feedback/admin/summary", unknownShape);
}

export function exportCSV(destination: ExportDestination = "local") {
  const suffix = destination === "local" ? "" : `?destination=${destination}`;
  return apiGet(`/feedback/admin/export/csv${suffix}`, unknownShape);
}

export function exportJSON(destination: ExportDestination = "local") {
  const suffix = destination === "local" ? "" : `?destination=${destination}`;
  return apiGet(`/feedback/admin/export/json${suffix}`, unknownShape);
}

export function generateDigest() {
  return apiPost("/feedback/admin/digest", unknownShape, {});
}

export function generateRoadmap() {
  return apiPost("/feedback/admin/roadmap", unknownShape, {});
}
