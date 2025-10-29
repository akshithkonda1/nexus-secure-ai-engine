import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { readProfile, writeProfile, type StoredProfile } from "@/services/storage/profile";

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => readProfile()
  });

  const mutation = useMutation({
    mutationFn: async (profile: StoredProfile) => writeProfile(profile),
    onSuccess: data => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    }
  });

  const saveProfile = useCallback(
    async (profile: StoredProfile) => {
      const updated = await mutation.mutateAsync(profile);
      return updated;
    },
    [mutation]
  );

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    saveProfile,
    isSaving: mutation.isPending
  };
}
