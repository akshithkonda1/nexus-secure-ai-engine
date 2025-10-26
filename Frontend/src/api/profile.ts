export type Profile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

const LS_KEY = "nexus.profile";

function readLS(): Profile {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);
  const seed: Profile = {
    id: "me",
    email: "akkikonda2000@gmail.com",
    displayName: "Akshith",
    avatarUrl: null,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}

function writeLS(p: Profile) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

export async function fetchProfile(): Promise<Profile> {
  return readLS();
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const cur = readLS();
  const next = { ...cur, ...patch };
  writeLS(next);
  return next;
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  return { url: dataUrl };
}

export async function removeAvatar(): Promise<void> {
  const cur = readLS();
  writeLS({ ...cur, avatarUrl: null });
}

export async function deleteAccount(): Promise<void> {
  localStorage.removeItem(LS_KEY);
}
