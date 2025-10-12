import { useEffect, useState } from "react";
export function useAuth() {
  const [ready,setReady] = useState(false);
  const [user,setUser] = useState<{id:string|undefined}|null>(null);
  useEffect(()=>{ /* TODO: call /me to validate cookie session */ setReady(true); },[]);
  return { ready, user, setUser };
}
