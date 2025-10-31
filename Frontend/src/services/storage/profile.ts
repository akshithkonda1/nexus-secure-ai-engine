const PROFILE_KEY = "nexus.profile";

export type Profile = {
  displayName: string;
  avatarUrl?: string;
  updatedAt: number;
};

const DEFAULT_PROFILE: Profile = {
  displayName: "Nexus Researcher",
  avatarUrl: undefined,
  updatedAt: Date.now()
};

export function getProfile(): Profile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Profile;
    return {
      ...DEFAULT_PROFILE,
      ...parsed
    };
  } catch (error) {
    console.warn("Failed to parse profile", error);
    return DEFAULT_PROFILE;
  }
}

export async function setProfile(profile: Omit<Profile, "updatedAt">): Promise<Profile> {
  const next: Profile = { ...profile, updatedAt: Date.now() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearProfileAvatar() {
  if (typeof window === "undefined") return;
  const profile = getProfile();
  const next = { ...profile, avatarUrl: undefined };
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
}
