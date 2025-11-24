import { getItem, removeItem, setItem } from "@/lib/storage";
import { Project, EncryptedProjectPayload } from "./types";

const STORAGE_KEY = "toron:projects:v1";
const KEY_STORAGE_KEY = "toron:projects:key";
const STORAGE_VERSION = 1;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const uint8ArrayToBase64 = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const assertKey = (bytes: Uint8Array) => {
  if (bytes.byteLength !== 32) {
    throw new Error("AES-256-GCM requires a 256-bit key");
  }
};

const createKeyMaterial = () => {
  const random = crypto.getRandomValues(new Uint8Array(32));
  return uint8ArrayToBase64(random);
};

const getOrCreateBase64Key = (): string => {
  const existing = typeof window !== "undefined" ? localStorage.getItem(KEY_STORAGE_KEY) : null;
  if (existing && existing.length > 0) return existing;
  const envKey = (import.meta as any)?.env?.VITE_PROJECTS_AES_KEY as string | undefined;
  if (envKey && envKey.length > 0) return envKey;
  const generated = createKeyMaterial();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY_STORAGE_KEY, generated);
    } catch (error) {
      console.warn("Unable to persist project key", error);
    }
  }
  return generated;
};

const importKey = async (): Promise<CryptoKey> => {
  const base64Key = getOrCreateBase64Key();
  const keyBytes = base64ToUint8Array(base64Key.trim());
  assertKey(keyBytes);
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
};

const encrypt = async (plaintext: string): Promise<EncryptedProjectPayload> => {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
  return {
    algorithm: "AES-256-GCM",
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(encrypted),
    version: STORAGE_VERSION,
  } satisfies EncryptedProjectPayload;
};

const decrypt = async (payload: EncryptedProjectPayload): Promise<string> => {
  const key = await importKey();
  const iv = base64ToUint8Array(payload.iv);
  const cipherBytes = base64ToUint8Array(payload.ciphertext);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return decoder.decode(decrypted);
};

export const projectStorage = {
  async load(): Promise<Project[]> {
    if (typeof window === "undefined" || !window.crypto?.subtle) return [];
    try {
      const payload = await getItem<EncryptedProjectPayload | null>(STORAGE_KEY);
      if (!payload || payload.algorithm !== "AES-256-GCM") return [];
      const raw = await decrypt(payload);
      const parsed = JSON.parse(raw) as { version: number; projects?: Project[] };
      if (parsed?.version !== STORAGE_VERSION || !Array.isArray(parsed?.projects)) {
        return [];
      }
      return parsed.projects;
    } catch (error) {
      console.warn("Failed to load project storage", error);
      return [];
    }
  },

  async persist(projects: Project[]): Promise<void> {
    if (typeof window === "undefined" || !window.crypto?.subtle) return;
    const payload = await encrypt(JSON.stringify({ version: STORAGE_VERSION, projects }));
    await setItem(STORAGE_KEY, payload);
  },

  async clear(): Promise<void> {
    await removeItem(STORAGE_KEY);
  },
};

