import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { CreateDocumentResponse, DocumentsResponse } from "@/types/models";

type UploadPayload = { name: string; size: number; type: string };

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => apiGet("/api/docs", DocumentsResponse),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadPayload) =>
      apiPost("/api/docs", CreateDocumentResponse, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
