import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { fetchProfile, updateProfile, type UpdateProfilePayload, type UserProfile } from "@/services/profile";

type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  saving: boolean;
  error?: string;
  refresh: () => Promise<void>;
  update: (payload: UpdateProfilePayload) => Promise<UserProfile>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const data = await fetchProfile(controller.signal);
      setProfile(data);
      setError(undefined);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }
      const message = err instanceof Error ? err.message : "Unable to load profile";
      setError(message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  const update = useCallback(async (payload: UpdateProfilePayload) => {
    setSaving(true);
    try {
      const next = await updateProfile(payload);
      setProfile(next);
      setError(undefined);
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update profile";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loading, saving, error, refresh, update }),
    [profile, loading, saving, error, refresh, update],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
