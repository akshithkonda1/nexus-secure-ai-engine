import { describe, expect, it, beforeEach } from 'vitest';
import {
  readProfile,
  resetProfile,
  subscribeToProfile,
  updateProfile,
  writeProfile,
  type UserProfile,
} from '../state/profile';

const testProfile: UserProfile = {
  displayName: 'Test User',
  email: 'tester@nexus.ai',
  avatarDataUrl: null,
  bio: 'Testing profile persistence',
};

describe('profile storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProfile();
  });

  it('persists updates and notifies subscribers', () => {
    const seen: UserProfile[] = [];
    const unsubscribe = subscribeToProfile(profile => {
      seen.push(profile);
    });

    const saved = writeProfile(testProfile);

    expect(saved.displayName).toBe(testProfile.displayName);
    expect(readProfile().displayName).toBe(testProfile.displayName);
    expect(seen).toHaveLength(1);
    expect(seen[0].email).toBe(testProfile.email);

    unsubscribe();
  });

  it('supports functional updates via updateProfile', () => {
    writeProfile(testProfile);

    const saved = updateProfile(prev => ({
      ...prev,
      displayName: 'Updated User',
    }));

    expect(saved.displayName).toBe('Updated User');
    expect(readProfile().displayName).toBe('Updated User');
  });

  it('resets to defaults and notifies listeners', () => {
    writeProfile(testProfile);

    const seen: string[] = [];
    const unsubscribe = subscribeToProfile(profile => {
      seen.push(profile.displayName);
    });

    const reset = resetProfile();

    expect(reset.displayName).toBe('Nexus Explorer');
    expect(readProfile().displayName).toBe('Nexus Explorer');
    expect(seen.at(-1)).toBe('Nexus Explorer');

    unsubscribe();
  });
});
