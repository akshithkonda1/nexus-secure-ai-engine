export interface StoredProfile {
  displayName: string;
  avatarDataUrl: string | null;
  updatedAt: string;
}

const PROFILE_KEY = "nexus.profile";

const defaultProfile: StoredProfile = {
  displayName: "Guest of Nexus",
  avatarDataUrl: null,
  updatedAt: new Date(0).toISOString(),
};

export function getStoredProfile(): StoredProfile {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return defaultProfile;
    }
    const parsed = JSON.parse(raw) as StoredProfile;
    if (!parsed.displayName) {
      return defaultProfile;
    }
    return {
      displayName: parsed.displayName,
      avatarDataUrl: parsed.avatarDataUrl ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Failed to parse profile", error);
    return defaultProfile;
  }
}

export function setStoredProfile(profile: StoredProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearStoredAvatar(): StoredProfile {
  const profile = getStoredProfile();
  const updated: StoredProfile = {
    ...profile,
    avatarDataUrl: null,
    updatedAt: new Date().toISOString(),
  };
  setStoredProfile(updated);
  return updated;
}

export function updateStoredProfile(partial: Partial<StoredProfile>): StoredProfile {
  const current = getStoredProfile();
  const updated: StoredProfile = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  setStoredProfile(updated);
  return updated;
}
