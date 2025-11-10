import { currentUser } from "./currentUser";

export function getFirstName(profile?: { fullName?: string } | null) {
  const raw =
    profile?.fullName?.trim() ||
    localStorage.getItem("nexus.fullName")?.trim() ||
    currentUser.name;

  return raw.split(/\s+/)[0]; // e.g., "Avery"
}
