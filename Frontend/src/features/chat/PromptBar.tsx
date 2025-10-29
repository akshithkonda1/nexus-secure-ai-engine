import { Paperclip, SendHorizonal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/shared/ui/theme/ThemeProvider";

const quickPrompts = [
  { id: "explain", label: "Explain simply", prompt: "Explain this concept in the simplest possible terms." },
  { id: "summarize", label: "Summarize", prompt: "Summarize the last exchange and highlight the key points." },
];

interface PromptBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (prompt: string) => void;
  onCreateStudyPack: () => void;
  isSending?: boolean;
}

export function PromptBar({ value, onChange, onSend, onCreateStudyPack, isSending }: PromptBarProps): JSX.Element {
  const { mode } = useThemeContext();

  return (
    <div className="border-t border-subtle bg-[var(--app-surface)] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {quickPrompts.map((quick) => (
          <Button key={quick.id} variant="outline" size="sm" onClick={() => onSend(quick.prompt)}>
            <Sparkles className="mr-2 h-4 w-4" />
            {quick.label}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={onCreateStudyPack}>
          <Sparkles className="mr-2 h-4 w-4" />
          Create dummy study pack
        </Button>
      </div>
      <div className="flex items-end gap-3">
        <Button variant="outline" size="icon" aria-label="Attach reference">
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          className="min-h-[60px] flex-1 resize-y rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mode-accent-solid)]"
          placeholder={getPlaceholder(mode)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              onSend(value);
            }
          }}
        />
        <Button size="icon" onClick={() => onSend(value)} disabled={isSending || value.trim().length === 0} aria-label="Send message">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getPlaceholder(mode: string) {
  if (mode === "student") {
    return "Ask Nexus to walk through a topic step by step…";
  }
  if (mode === "business") {
    return "Request an executive-ready insight or scenario analysis…";
  }
  return "Direct Nexus OS with precise instructions or data references…";
}
