import crypto from 'crypto';

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
}

const ALGORITHM = 'aes-256-gcm';

export class Encryption {
  constructor(private key: Buffer) {}

  encrypt(data: string): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      cipherText: Buffer.concat([encrypted, tag]).toString('base64'),
      iv: iv.toString('base64'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const iv = Buffer.from(payload.iv, 'base64');
    const data = Buffer.from(payload.cipherText, 'base64');
    const tag = data.slice(data.length - 16);
    const text = data.slice(0, data.length - 16);
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

export const ephemeralEncryption = new Encryption(crypto.randomBytes(32));
