import crypto from 'crypto';

export interface HashResult {
  hash: string;
  salt: string;
}

export class HashingService {
  private rotatingSalt: string;

  constructor(seedSalt?: string) {
    this.rotatingSalt = seedSalt ?? this.generateSalt();
  }

  generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  rotateSalt(): void {
    this.rotatingSalt = this.generateSalt();
  }

  hashIdentifier(value: string, salt?: string): HashResult {
    const effectiveSalt = salt ?? this.rotatingSalt;
    const hash = crypto
      .createHash('sha256')
      .update(effectiveSalt + value)
      .digest('hex');
    return { hash, salt: effectiveSalt };
  }

  bucketIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length !== 4) return 'unknown-region';
    return `${parts[0]}.${parts[1]}.0.0`;
  }

  bucketTimestamp(date: Date): string {
    const iso = date.toISOString();
    return iso.slice(0, 13); // hour bucket
  }
}
