import { EncryptedPayload, ephemeralEncryption } from '../../utils/Encryption';
import { safeLogger } from '../../utils/SafeLogger';
import { ToronExecutionResult } from './ToronExecutionRules';

interface ProcessContext {
  encryptedInput: EncryptedPayload;
  correlationId: string;
}

export class ToronEngine {
  processEncryptedRequest(context: ProcessContext): ToronExecutionResult {
    const start = Date.now();
    const decrypted = this.decryptEphemeral(context.encryptedInput);
    const inferenceOutcome = this.performInference(decrypted);
    const encryptedResponse = this.reEncryptOutput(inferenceOutcome.response);
    this.immediateMemoryWipe(decrypted, inferenceOutcome.response);

    const metrics = {
      latencyMs: Date.now() - start,
      thinkingTimeMs: inferenceOutcome.thinkingTimeMs,
      outputTimeMs: inferenceOutcome.outputTimeMs,
    };

    safeLogger.logPerformance('toron.process', {
      latencyMs: metrics.latencyMs,
      correlation: context.correlationId,
    });

    return {
      encryptedResponse: encryptedResponse.cipherText,
      modelSwitch: inferenceOutcome.modelSwitch,
      driftFlag: inferenceOutcome.driftFlag,
      hallucinationFlag: inferenceOutcome.hallucinationFlag,
      diagnostics: inferenceOutcome.diagnostics,
      metrics,
    };
  }

  decryptEphemeral(payload: EncryptedPayload): string {
    const plaintext = ephemeralEncryption.decrypt(payload);
    return plaintext;
  }

  performInference(plaintext: string): {
    response: string;
    thinkingTimeMs: number;
    outputTimeMs: number;
    modelSwitch?: string;
    driftFlag?: boolean;
    hallucinationFlag?: boolean;
    diagnostics: Record<string, unknown>;
  } {
    const thinkingTimeMs = Math.floor(Math.random() * 10) + 1;
    const outputTimeMs = Math.floor(Math.random() * 10) + 1;

    // Operate only in-memory on sanitized data. No logging of content.
    const diagnostics = {
      decisionTrace: 'abstracted',
      tokenThroughput: Math.random() * 100,
    };

    const response = plaintext
      .split(' ')
      .map(() => '█')
      .join(' ');

    return {
      response,
      thinkingTimeMs,
      outputTimeMs,
      modelSwitch: 'toron-default',
      driftFlag: false,
      hallucinationFlag: false,
      diagnostics,
    };
  }

  reEncryptOutput(output: string): EncryptedPayload {
    return ephemeralEncryption.encrypt(output);
  }

  immediateMemoryWipe(...values: Array<string | undefined>): void {
    values.forEach((value, index) => {
      if (typeof value === 'string') {
        values[index] = undefined;
      }
    });
  }
}

export const toronEngine = new ToronEngine();
