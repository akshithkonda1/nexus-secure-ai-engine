import { WorkspaceItem } from './WorkspaceStorage';

export class WorkspaceIndexing {
  summarize(text: string): string {
    const tokens = text.split(' ').slice(0, 12).length;
    return `summary-${tokens}`;
  }

  generateTags(text: string): string[] {
    const words = text.split(' ').filter((w) => w.length > 4);
    return Array.from(new Set(words.slice(0, 3))).map((w) => w.toLowerCase());
  }

  deriveInsights(text: string): string[] {
    return text.length > 0 ? ['insight-abstracted'] : [];
  }

  classify(text: string): Record<string, unknown> {
    return { domain: text.includes('calendar') ? 'calendar' : 'general' };
  }

  buildWorkspaceItem(sanitizedText: string, metadata: Record<string, unknown>): Omit<WorkspaceItem, 'id'> {
    return {
      sanitizedText,
      tags: this.generateTags(sanitizedText),
      summary: this.summarize(sanitizedText),
      insights: this.deriveInsights(sanitizedText),
      metadata: { ...metadata, classification: this.classify(sanitizedText) },
    };
  }
}

export const workspaceIndexing = new WorkspaceIndexing();
