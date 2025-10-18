const LS_PROFILE = 'nexus_profile_v1';

export type UserProfile = {
  displayName: string;
  email: string;
  avatarDataUrl: string | null;
};

const defaults: UserProfile = {
  displayName: 'Akshith',
  email: 'akkikonda2000@gmail.com',
  avatarDataUrl: null,
};

export const readProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return defaults;
  }
  try {
    const stored = window.localStorage.getItem(LS_PROFILE);
    if (!stored) {
      return defaults;
    }
    const parsed = JSON.parse(stored) as Partial<UserProfile> | null;
    return { ...defaults, ...(parsed || {}) };
  } catch (error) {
    console.warn('Failed to read profile from storage', error);
    return defaults;
  }
};

export const writeProfile = (next: UserProfile): UserProfile => {
  if (typeof window === 'undefined') {
    return next;
  }
  try {
    window.localStorage.setItem(LS_PROFILE, JSON.stringify(next));
  } catch (error) {
    console.warn('Failed to write profile to storage', error);
  }
  return next;
};

export const resetProfile = (): UserProfile => {
  if (typeof window === 'undefined') {
    return defaults;
  }
  try {
    window.localStorage.removeItem(LS_PROFILE);
  } catch (error) {
    console.warn('Failed to clear profile from storage', error);
  }
  return defaults;
};
