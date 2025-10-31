import { useState } from "react";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

interface PromptBarProps {
  disabled?: boolean;
  onSubmit: (message: string) => Promise<void>;
}

const quickPrompts = ["Explain simply", "Summarize", "Create dummy study pack"];

export function PromptBar({ disabled, onSubmit }: PromptBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    await onSubmit(value.trim());
    setValue("");
  };

  const handleQuick = async (prompt: string) => {
    setValue(prompt);
    if (!disabled) {
      await onSubmit(prompt);
      setValue("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <Button key={prompt} variant="ghost" size="sm" type="button" onClick={() => handleQuick(prompt)}>
            {prompt}
          </Button>
        ))}
      </div>
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask Nexus.ai anything…"
          aria-label="Message Nexus.ai"
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !value.trim()}>
          {disabled ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
