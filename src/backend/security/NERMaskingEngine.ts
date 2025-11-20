export type EntityLabel = 'PERSON' | 'ORG' | 'GPE' | 'NORP' | 'LOC' | 'DATE' | 'FAC';

export interface EntitySpan {
  start: number;
  end: number;
  label: EntityLabel;
}

export class NERMaskingEngine {
  constructor(private readonly modelHint: string = 'lightweight-rule') {}

  maskEntities(text: string): string {
    const spans = this.detectEntities(text);
    if (!spans.length) return text;

    let masked = '';
    let cursor = 0;
    spans
      .sort((a, b) => a.start - b.start)
      .forEach((span) => {
        masked += text.slice(cursor, span.start);
        masked += this.labelToToken(span.label);
        cursor = span.end;
      });
    masked += text.slice(cursor);
    return masked;
  }

  private detectEntities(text: string): EntitySpan[] {
    const matches: EntitySpan[] = [];
    const patterns: Record<EntityLabel, RegExp> = {
      PERSON: /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g,
      ORG: /\b([A-Z][A-Za-z]+\s+(Inc|LLC|Ltd|Corporation|Corp|Company))\b/g,
      GPE: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g,
      NORP: /\b(Asian|European|African|American|Arab)\b/gi,
      LOC: /\b(Mountain|River|Lake|Ocean)\b/gi,
      DATE: /\b\d{4}-\d{2}-\d{2}\b/g,
      FAC: /\b(Building|Facility|Center)\b/gi,
    };

    (Object.keys(patterns) as EntityLabel[]).forEach((label) => {
      const regex = patterns[label];
      let match: RegExpExecArray | null = null;
      while ((match = regex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, label });
      }
    });

    return matches;
  }

  private labelToToken(label: EntityLabel): string {
    switch (label) {
      case 'PERSON':
        return '[REDACTED_PERSON]';
      case 'ORG':
        return '[REDACTED_ORG]';
      case 'GPE':
      case 'LOC':
      case 'FAC':
        return '[REDACTED_LOCATION]';
      case 'NORP':
        return '[REDACTED_AFFILIATION]';
      case 'DATE':
        return '[REDACTED_DATE]';
      default:
        return '[REDACTED]';
    }
  }
}
