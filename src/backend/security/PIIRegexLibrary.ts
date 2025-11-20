export type PIIRegexKey =
  | 'name'
  | 'email'
  | 'phone'
  | 'address'
  | 'gps'
  | 'ip'
  | 'ssn'
  | 'driverLicense'
  | 'passport'
  | 'dob'
  | 'medicalRecord'
  | 'insurance'
  | 'financial'
  | 'authToken'
  | 'cookie'
  | 'deviceId'
  | 'organization';

export class PIIRegexLibrary {
  private static readonly patterns: Record<PIIRegexKey, RegExp> = {
    name: /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g, // simplistic name detection
    email: /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,
    phone: /\+?\d?[\s.-]?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/g,
    address: /(\d+\s+[^,]+,?\s+[A-Za-z\s]+,?\s+[A-Z]{2,}\s+\d{5})/g,
    gps: /([-+]?\d{1,2}\.\d+),\s*([-+]?\d{1,3}\.\d+)/g,
    ip: /\b((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    driverLicense: /\b([A-Z]{1,2}\d{6,8})\b/g,
    passport: /\b([A-Z]\d{7,8})\b/g,
    dob: /\b\d{4}-\d{2}-\d{2}\b/g,
    medicalRecord: /\b(MRN\s*\d{5,})\b/g,
    insurance: /\b(INS\s*\d{6,})\b/g,
    financial: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    authToken: /(Bearer|Token)\s+[A-Za-z0-9\-_.]+/gi,
    cookie: /(?i)(session|auth|token|sid)=([A-Za-z0-9%_.-]+)/g,
    deviceId: /\b(device|did|imei)[:=][A-Za-z0-9-]+/gi,
    organization: /\b([A-Z][a-z]+\s+(Corporation|Corp|Inc|LLC|Ltd|Company))\b/g,
  };

  static sanitizeText(text: string): string {
    let sanitized = text;
    Object.values(this.patterns).forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  static getPatterns(): Record<PIIRegexKey, RegExp> {
    return this.patterns;
  }
}
