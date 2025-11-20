import crypto from 'crypto';

export interface EncryptionPayload {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

export class EncryptionLayer {
  constructor(private readonly key: Buffer = crypto.randomBytes(32)) {}

  encryptInbound(plaintext: Buffer | string): EncryptionPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return { ciphertext, iv, authTag };
  }

  decryptEphemeral(payload: EncryptionPayload): Buffer {
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, payload.iv);
    decipher.setAuthTag(payload.authTag);
    const decrypted = Buffer.concat([decipher.update(payload.ciphertext), decipher.final()]);
    return decrypted;
  }

  encryptOutbound(plaintext: Buffer | string): EncryptionPayload {
    return this.encryptInbound(plaintext);
  }

  wipeMemory(buffers: Buffer[]): void {
    buffers.forEach((buffer) => buffer.fill(0));
  }
}

export const encryptionLayer = new EncryptionLayer();
