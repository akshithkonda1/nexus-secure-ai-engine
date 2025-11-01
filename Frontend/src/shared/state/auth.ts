import { create } from "zustand";
type User = { id: string; name: string; email?: string };
type State = { user?: User; loading: boolean; setUser(u?:User):void; setLoading(b:boolean):void; };
export const useAuth = create<State>((set)=>({
  loading: true, setUser: (user)=> set({ user }), setLoading: (b)=> set({ loading: b }),
}));
export async function bootstrapAuth() {
  const { setUser, setLoading } = useAuth.getState();
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) { const { user } = await res.json(); setUser(user); } else { setUser(undefined); }
  } finally { setLoading(false); }
}
