import { z } from "zod";

import { apiGet, apiPatch } from "@/lib/api";

const NotificationsSchema = z.object({
  productUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  securityAlerts: z.boolean(),
});

export const UserProfileSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  handle: z.string().min(1),
  role: z.string(),
  email: z.string().email(),
  workspace: z.string(),
  timezone: z.string(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  notifications: NotificationsSchema,
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateProfilePayload = Partial<
  Omit<UserProfile, "id" | "createdAt" | "updatedAt" | "notifications">
> & {
  notifications?: Partial<UserProfile["notifications"]>;
};

const API_ROUTE = "/api/profile";

const FALLBACK_PROFILE: UserProfile = {
  id: "fallback",
  fullName: "Avery Quinn",
  handle: "@avery.quinn",
  role: "Director of AI Programs",
  email: "avery.quinn@ryuzen.ai",
  workspace: "Secure AI Engine",
  timezone: "America/Los_Angeles",
  phone: "+1-415-555-0147",
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notifications: {
    productUpdates: true,
    weeklyDigest: true,
    securityAlerts: true,
  },
};

export async function fetchProfile(signal?: AbortSignal): Promise<UserProfile> {
  try {
    return await apiGet(API_ROUTE, UserProfileSchema, { signal, timeoutMs: 8000 });
  } catch (error) {
    console.warn("Falling back to local profile payload", error);
    return FALLBACK_PROFILE;
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  return apiPatch(API_ROUTE, UserProfileSchema, payload, { timeoutMs: 8000 });
}
