const encoder = new TextEncoder();

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

const assertKeyLength = (keyBytes: Uint8Array) => {
  if (keyBytes.byteLength !== 32) {
    throw new Error("AES key must be 256 bits (32 bytes) when base64 decoded.");
  }
};

export const importAesKey = async (base64Key: string): Promise<CryptoKey> => {
  const keyBytes = base64ToUint8Array(base64Key.trim());
  assertKeyLength(keyBytes);

  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
};

export interface AesEncryptedPayload {
  algorithm: "AES-256-GCM";
  iv: string;
  ciphertext: string;
}

export const encryptWithAesGcm = async (plaintext: string, base64Key: string): Promise<AesEncryptedPayload> => {
  const key = await importAesKey(base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  return {
    algorithm: "AES-256-GCM",
    iv: uint8ArrayToBase64(iv),
    ciphertext: uint8ArrayToBase64(encrypted),
  };
};
