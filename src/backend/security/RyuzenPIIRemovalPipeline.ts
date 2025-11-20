import { PIIRegexLibrary } from './PIIRegexLibrary';
import { NERMaskingEngine } from './NERMaskingEngine';
import { MetadataCleaner, FileMetadata, MetadataCleanResult } from './MetadataCleaner';
import { HashingService, HashResult } from './HashingService';

export interface SanitizationInput {
  text?: string;
  metadata?: FileMetadata;
}

export interface SanitizationOutput {
  sanitizedText: string;
  sanitizedMetadata: FileMetadata;
  metadataReport: MetadataCleanResult;
  hashedIdentifiers: HashResult[];
}

export class RyuzenPIIRemovalPipeline {
  private readonly regexLibrary = new PIIRegexLibrary();
  private readonly nerEngine = new NERMaskingEngine();
  private readonly metadataCleaner = new MetadataCleaner();
  private readonly hashingService: HashingService;

  constructor(hashingService?: HashingService) {
    this.hashingService = hashingService ?? new HashingService();
  }

  execute(input: SanitizationInput): SanitizationOutput {
    const text = input.text ?? '';
    const metadata = input.metadata ?? {};

    const regexPhase = this.regexPhase(text);
    const nerPhase = this.nerPhase(regexPhase);
    const metadataPhase = this.metadataPhase(metadata);
    const reconstructed = this.reconstructionPhase(nerPhase);
    const hashing = this.hashingPhase(reconstructed);

    return {
      sanitizedText: reconstructed,
      sanitizedMetadata: metadataPhase.cleanedMetadata,
      metadataReport: metadataPhase,
      hashedIdentifiers: hashing,
    };
  }

  private regexPhase(text: string): string {
    return PIIRegexLibrary.sanitizeText(text);
  }

  private nerPhase(text: string): string {
    return this.nerEngine.maskEntities(text);
  }

  private metadataPhase(metadata: FileMetadata): MetadataCleanResult {
    return this.metadataCleaner.scrub(metadata);
  }

  private reconstructionPhase(text: string): string {
    const normalizedWhitespace = text.replace(/\s{2,}/g, ' ').trim();
    const normalizedPunctuation = normalizedWhitespace.replace(/\s+([.,;:!?])/g, '$1');
    return normalizedPunctuation.replace(/\s{3,}/g, ' [GAP] ');
  }

  private hashingPhase(text: string): HashResult[] {
    const tokens = text.split(/\s+/).filter(Boolean);
    return tokens.map((token) => this.hashingService.hashIdentifier(token));
  }
}
