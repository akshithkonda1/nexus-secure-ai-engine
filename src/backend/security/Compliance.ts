export const complianceSummary = {
  gdpr: {
    retention: 'No personal data retained; zero content storage.',
    minimization: 'PII stripped via mandatory sanitization pipeline.',
    crossBorder: 'No cross-border PII transfer because no PII is stored.',
  },
  ccpa: {
    sale: 'No sale or sharing of personal data.',
    retention: 'No identifiable user data is retained.',
    telemetry: 'Telemetry is anonymized and model-only.',
  },
  hipaa: {
    phi: 'No PHI is ingested into the system.',
    storage: 'No ePHI storage eliminates covered-entity risk.',
    audit: 'No audit history of PHI because none enters the system.',
  },
  iso27001: {
    a8: 'Minimal data footprint with aggressive sanitization.',
    a10: 'AES-256-GCM at rest and TLS 1.3 in transit.',
    a12: 'Logging omits PII entirely.',
    a14: 'Privacy-first SDLC baked into architecture.',
  },
  soc2: {
    security: 'Zero-knowledge design satisfies security principle.',
    confidentiality: 'Confidentiality maintained because no PII stored.',
    availability: 'Availability maintained via separated telemetry.',
  },
  nist80053: {
    ac3: 'Access controls enforced with minimized data surface.',
    ac4: 'Sanitization boundary before any downstream module.',
    sc12: 'Modern cryptography enforced across pathways.',
    sc13: 'AES-256-GCM and TLS 1.3 for encryption requirements.',
    sc28: 'Data protection enforced through hashing and encryption.',
    pl8: 'Secure-by-design planning documented.',
    si12: 'Sanitization is mandatory for all inputs and metadata.',
  },
};
