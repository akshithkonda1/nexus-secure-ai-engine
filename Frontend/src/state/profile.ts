const LS_PROFILE = 'nexus_profile_v1';

export type UserProfile = {
  displayName: string;
  email: string;
  avatarDataUrl: string | null;
  bio: string;
};

const defaults: UserProfile = {
  displayName: 'Nexus Explorer',
  email: 'explorer@nexus.ai',
  avatarDataUrl: null,
  bio: '',
};

type ProfileListener = (profile: UserProfile) => void;

const listeners = new Set<ProfileListener>();

const cloneProfile = (profile: Partial<UserProfile> | null | undefined): UserProfile => {
  const merged: UserProfile = {
    ...defaults,
    ...(profile || {}),
  };
  return {
    ...merged,
    displayName: merged.displayName?.trim?.() || defaults.displayName,
    email: merged.email?.trim?.() || defaults.email,
    avatarDataUrl: typeof merged.avatarDataUrl === 'string' ? merged.avatarDataUrl : null,
    bio: merged.bio ?? '',
  };
};

const notify = (profile: UserProfile) => {
  for (const listener of listeners) {
    try {
      listener(profile);
    } catch (error) {
      console.warn('Profile listener failed', error);
    }
  }
};

let storageListenerRegistered = false;

const ensureStorageListener = () => {
  if (storageListenerRegistered || typeof window === 'undefined') {
    return;
  }
  window.addEventListener('storage', event => {
    if (event.key === LS_PROFILE) {
      notify(readProfile());
    }
  });
  storageListenerRegistered = true;
};

export const readProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return { ...defaults };
  }
  try {
    const stored = window.localStorage.getItem(LS_PROFILE);
    if (!stored) {
      return { ...defaults };
    }
    const parsed = JSON.parse(stored) as Partial<UserProfile> | null;
    return cloneProfile(parsed);
  } catch (error) {
    console.warn('Failed to read profile from storage', error);
    return { ...defaults };
  }
};

export const writeProfile = (next: UserProfile): UserProfile => {
  const payload = cloneProfile(next);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LS_PROFILE, JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to write profile to storage', error);
    }
  }

  notify(payload);
  return payload;
};

export const resetProfile = (): UserProfile => {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LS_PROFILE);
    } catch (error) {
      console.warn('Failed to clear profile from storage', error);
    }
  }

  const profile = { ...defaults };
  notify(profile);
  return profile;
};

export const subscribeToProfile = (listener: ProfileListener): (() => void) => {
  ensureStorageListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const updateProfile = (
  updater: UserProfile | ((current: UserProfile) => UserProfile),
): UserProfile => {
  const current = readProfile();
  const next = typeof updater === 'function' ? (updater as (value: UserProfile) => UserProfile)(current) : updater;
  return writeProfile(next);
};
