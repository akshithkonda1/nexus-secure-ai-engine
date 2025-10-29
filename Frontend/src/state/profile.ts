import { readProfile as readStoredProfile, writeProfile as writeStoredProfile, type StoredProfile } from "@/services/storage/profile";

export type UserProfile = StoredProfile;

export const readProfile = (): UserProfile => readStoredProfile();

export const writeProfile = (next: UserProfile): UserProfile => writeStoredProfile(next);

export const resetProfile = (): UserProfile => {
  const cleared = {
    ...readStoredProfile(),
    avatarDataUrl: null
  };
  return writeStoredProfile(cleared);
};
