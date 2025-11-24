import { ContextWindowEntry } from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const sanitizeSummary = (text: string): string =>
  text
    .replace(/[\w.-]+@[\w.-]+/g, "[redacted]")
    .replace(/\b\d{4,}\b/g, "[num]")
    .slice(0, 280);

export class ToronContextWindow {
  private window: ContextWindowEntry[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 15) {
    this.maxSize = clamp(maxSize, 10, 25);
  }

  addEntry(entry: ContextWindowEntry): void {
    const sanitizedEntry: ContextWindowEntry = {
      ...entry,
      summary: sanitizeSummary(entry.summary),
      meaningVector: entry.meaningVector.map((value) =>
        Number.isFinite(value) ? value : 0
      ),
    };

    this.window.push(sanitizedEntry);
    this.truncateTail();
  }

  getWindow(): ContextWindowEntry[] {
    return [...this.window];
  }

  getSemanticDensityScore(): number {
    if (this.window.length === 0) return 0;
    const density = this.window.reduce((acc, item) => {
      const vectorMagnitude = Math.sqrt(
        item.meaningVector.reduce((sum, value) => sum + value * value, 0)
      );
      const summaryWeight = Math.min(item.summary.length / 120, 1);
      return acc + vectorMagnitude * 0.6 + summaryWeight * 0.4;
    }, 0);

    const normalized = density / this.window.length;
    return clamp(normalized / 10, 0, 1);
  }

  reset(): void {
    this.window = [];
  }

  private truncateTail(): void {
    if (this.window.length <= this.maxSize) return;
    const excess = this.window.length - this.maxSize;
    this.window.splice(0, excess);
  }
}

export const deriveMeaningVector = (summary: string): number[] => {
  const sanitized = sanitizeSummary(summary);
  const hash = Array.from(sanitized).reduce((acc, char, index) => {
    const code = char.charCodeAt(0);
    return acc + (code * (index + 1)) % 97;
  }, 0);
  const base = (hash % 1000) / 1000;
  return [base, base * 0.7 + 0.1, base * 0.4 + 0.2];
};

export const summarizeInputSafely = (input: string): string => {
  const sanitized = sanitizeSummary(input.toLowerCase());
  const tokens = sanitized.split(/\s+/).filter(Boolean);
  const uniqueTokens = Array.from(new Set(tokens)).slice(0, 20);
  return uniqueTokens.join(" ");
};
