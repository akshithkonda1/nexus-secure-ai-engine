import { create } from "zustand";

export type Provider = "password" | "google" | "apple" | "facebook" | "x";
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  dob?: string;          // ISO yyyy-mm-dd
  provider: Provider;    // decides locking behavior
};

type S = {
  user: User;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (pwd: string) => Promise<void>;
};

export const useAuth = create<S>(() => ({
  user: {
    id: "u_123",
    name: "Morgan Vega",
    email: "morgan.vega@nexus.ai",
    avatarUrl: "",
    dob: "1998-06-15",
    provider: "google",
  },
  async updateProfile(patch) {
    const s = useAuth.getState();
    useAuth.setState({ user: { ...s.user, ...patch } });
    await new Promise((r) => setTimeout(r, 250));
  },
  async updateEmail(email) {
    const s = useAuth.getState();
    useAuth.setState({ user: { ...s.user, email } });
    await new Promise((r) => setTimeout(r, 250));
  },
  async updatePassword(_pwd) {
    await new Promise((r) => setTimeout(r, 250));
  },
}));
