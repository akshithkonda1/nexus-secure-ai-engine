import React, { FormEvent, useRef, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: string[];
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Welcome to Nexus, an AI Debate Engine. Ask anything about your projects or documents.",
  },
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed && pendingAttachments.length === 0) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        attachments: pendingAttachments,
      },
    ]);

    setInputValue("");
    setPendingAttachments([]);
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingAttachments([]);
      return;
    }

    const fileNames = Array.from(files).map((file) => file.name);
    setPendingAttachments(fileNames);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="flex h-full flex-col gap-6">
      <header className="panel panel--immersive panel--alive rounded-2xl bg-[rgb(var(--panel))] px-6 py-4 shadow-[var(--elev-1)]">
        <h1 className="accent-ink text-xl font-semibold">Chat Console</h1>
        <p className="text-sm text-[rgb(var(--subtle))]">
          Collaborate with Nexus, attach documents, and keep discussions in one place.
        </p>
      </header>

      <div className="panel panel--immersive flex-1 overflow-hidden rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] shadow-[var(--elev-1)]">
        <div className="h-full overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`panel panel--immersive panel--alive rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-5 py-4 shadow-sm ${
                  message.role === "user" ? "border-brand/40" : ""
                }`}
              >
                <header className="mb-2 flex items-center gap-2 text-sm font-medium text-[rgb(var(--subtle))]">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand">
                    {message.role === "assistant" ? "AI" : "You"}
                  </span>
                  <span>{message.role === "assistant" ? "Nexus" : "You"}</span>
                </header>
                <p className="whitespace-pre-wrap leading-relaxed text-[rgb(var(--text))]">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {message.attachments.map((attachment) => (
                      <li
                        key={attachment}
                        className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-brand"
                      >
                        {attachment}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="panel panel--immersive panel--alive flex flex-col gap-3 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-4 shadow-[var(--elev-1)]"
      >
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          rows={3}
          placeholder="Ask a question or describe what you need..."
          className="input w-full resize-none rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />

        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {pendingAttachments.map((name) => (
              <span key={name} className="rounded-full bg-brand/10 px-3 py-1 text-brand">
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(event) => handleFileChange(event.target.files)}
            />
            <button
              type="button"
              onClick={triggerFilePicker}
              className="btn btn-quiet rounded-full border border-[color:rgba(var(--border))] px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel))]"
            >
              Attach files
            </button>
            {pendingAttachments.length > 0 && (
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="text-xs text-[rgb(var(--subtle))] underline"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary rounded-full bg-[rgba(var(--brand),0.98)] px-6 py-2 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-[var(--elev-1)] transition hover:shadow-[var(--elev-2)]"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}

export default Chat;
