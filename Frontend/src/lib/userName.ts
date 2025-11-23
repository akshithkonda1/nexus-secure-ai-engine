import { currentUser } from "@/lib/currentUser";
import type { UserProfile } from "@/services/profile";

export function getFirstName(profile?: Pick<UserProfile, "fullName"> | { fullName?: string | null } | null) {
  const raw =
    profile?.fullName?.trim() ||
    (typeof window !== "undefined" ? window.localStorage.getItem("ryuzen.fullName")?.trim() : undefined) ||
    currentUser.name;

  return raw.split(/\s+/)[0] ?? currentUser.name.split(/\s+/)[0]!;
}
