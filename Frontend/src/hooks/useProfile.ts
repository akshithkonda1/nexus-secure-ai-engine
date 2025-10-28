import { useCallback, useSyncExternalStore } from 'react';
import {
  readProfile,
  resetProfile,
  subscribeToProfile,
  updateProfile as updateProfileState,
  type UserProfile,
} from '../state/profile';

export type ProfileUpdater = UserProfile | ((current: UserProfile) => UserProfile);

type UseProfileResult = {
  profile: UserProfile;
  saveProfile: (updater: ProfileUpdater) => UserProfile;
  resetProfile: () => UserProfile;
};

export const useProfile = (): UseProfileResult => {
  const profile = useSyncExternalStore(subscribeToProfile, readProfile, readProfile);

  const saveProfile = useCallback(
    (updater: ProfileUpdater) => updateProfileState(updater),
    [],
  );

  const clearProfile = useCallback(() => resetProfile(), []);

  return {
    profile,
    saveProfile,
    resetProfile: clearProfile,
  };
};

export default useProfile;
