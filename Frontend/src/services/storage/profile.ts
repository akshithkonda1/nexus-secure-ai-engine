export type StoredProfile = {
  id: string;
  displayName: string;
  avatarDataUrl?: string | null;
  email?: string;
  bio?: string;
  updatedAt: number;
};

const STORAGE_KEY = "nexus.profile";

const defaultProfile: StoredProfile = {
  id: "local-user",
  displayName: "Anonymous Researcher",
  avatarDataUrl: null,
  email: "explorer@nexus.ai",
  bio: "",
  updatedAt: Date.now()
};

export function readProfile(): StoredProfile {
  if (typeof window === "undefined") {
    return defaultProfile;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw) as StoredProfile;
    return {
      ...defaultProfile,
      ...parsed,
      avatarDataUrl: parsed.avatarDataUrl ?? null
    };
  } catch (error) {
    console.warn("Failed to parse profile from storage", error);
    return defaultProfile;
  }
}

export function writeProfile(profile: StoredProfile): StoredProfile {
  const record: StoredProfile = {
    ...profile,
    updatedAt: Date.now()
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  }
  return record;
}

export function clearProfileAvatar() {
  const current = readProfile();
  writeProfile({ ...current, avatarDataUrl: null });
}
