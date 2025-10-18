export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL || "";
  if (!base) throw new Error("VITE_API_URL not set");
  return base.replace(/\/+$/, "");
}

function headers(): HeadersInit {
  const key = localStorage.getItem("nexus_api_key") || "";
  return { "Content-Type": "application/json", "X-API-Key": key };
}

export async function apiGET<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, { method: "GET", headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPOST<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
