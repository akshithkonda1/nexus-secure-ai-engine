import { create } from "zustand";

export type Provider = "password" | "google" | "apple" | "facebook" | "x";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  dob?: string;
  provider: Provider;
};

type AuthState = {
  user: User;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (pwd: string) => Promise<void>;
};

export const useAuth = create<AuthState>(() => ({
  user: {
    id: "u_123",
    name: "Morgan Vega",
    email: "morgan.vega@nexus.ai",
    avatarUrl: "",
    dob: "1998-06-15",
    provider: "google"
  },
  async updateProfile(patch) {
    const state = useAuth.getState();
    useAuth.setState({ user: { ...state.user, ...patch } });
    await new Promise((resolve) => setTimeout(resolve, 250));
  },
  async updateEmail(email) {
    const state = useAuth.getState();
    useAuth.setState({ user: { ...state.user, email } });
    await new Promise((resolve) => setTimeout(resolve, 250));
  },
  async updatePassword(_pwd) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}));
