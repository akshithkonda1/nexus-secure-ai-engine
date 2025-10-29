import { Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../../shared/ui/button";

interface PromptBarProps {
  onSend: (prompt: string) => void;
  onQuickAction: (action: string) => void;
}

const quickActions = [
  { id: "explain", label: "Explain simply" },
  { id: "summarize", label: "Summarize" },
  { id: "dummy-pack", label: "Create dummy study pack" },
];

export function PromptBar({ onSend, onQuickAction }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    onSend(prompt.trim());
    setPrompt("");
  };

  return (
    <div className="border-t border-subtle bg-surface/70 px-6 py-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="rounded-full border border-subtle bg-slate-900/10 px-3 py-1 text-xs font-medium text-muted transition hover:border-indigo-400 hover:text-white"
            onClick={() => onQuickAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <form className="flex items-center gap-3" onSubmit={handleSubmit}>
        <Button type="button" variant="ghost" size="icon" aria-label="Attach file">
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe your objective for Nexus…"
          rows={1}
          aria-label="Chat prompt"
          className="h-12 flex-1 resize-none rounded-lg border border-subtle bg-transparent px-3 py-2 text-sm text-inherit focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        />
        <Button type="submit" disabled={!prompt.trim()}>
          Send
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
