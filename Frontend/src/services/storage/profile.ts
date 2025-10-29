export interface ProfileRecord {
  displayName: string;
  avatarUrl: string | null;
}

const PROFILE_STORAGE_KEY = "nexus.profile";

const DEFAULT_PROFILE: ProfileRecord = {
  displayName: "Researcher",
  avatarUrl: null,
};

export function readProfile(): ProfileRecord {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(raw) as Partial<ProfileRecord>;
    return {
      displayName: typeof parsed.displayName === "string" && parsed.displayName.trim().length >= 2
        ? parsed.displayName
        : DEFAULT_PROFILE.displayName,
      avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : null,
    };
  } catch (error) {
    console.warn("Failed to read profile", error);
    return DEFAULT_PROFILE;
  }
}

export function writeProfile(profile: ProfileRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfileAvatar(): void {
  if (typeof window === "undefined") return;
  const profile = readProfile();
  writeProfile({ ...profile, avatarUrl: null });
}
