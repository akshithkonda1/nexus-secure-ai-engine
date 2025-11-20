export interface ToronExecutionResult {
  encryptedResponse: string;
  modelSwitch?: string;
  driftFlag?: boolean;
  hallucinationFlag?: boolean;
  diagnostics: Record<string, unknown>;
  metrics: Record<string, number>;
}

export const ToronRules = {
  allowPersistence: false,
  allowRawLogging: false,
  purgeAfterUse: true,
  encryptionRequired: true,
};
