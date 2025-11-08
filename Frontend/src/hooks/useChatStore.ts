import { create } from "zustand";
import { delay } from "@/lib/utils";

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  createdAt: number;
  status?: "loading" | "ready" | "error";
};

type ChatState = {
  messages: ChatMessage[];
  sending: boolean;
  sendMessage: (content: string, attachments: Attachment[]) => Promise<void>;
  reset: () => void;
};

const intro: ChatMessage = {
  id: "intro",
  role: "assistant",
  content:
    "Welcome to Nexus.ai — your private reasoning studio. Drop files, speak naturally, or select a template to launch a workflow.",
  createdAt: Date.now(),
  status: "ready"
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [intro],
  sending: false,
  async sendMessage(content, attachments) {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;
    const id = crypto.randomUUID();
    const now = Date.now();
    const userMessage: ChatMessage = {
      id,
      role: "user",
      content: trimmed,
      attachments,
      createdAt: now,
      status: "ready"
    };

    const placeholder: ChatMessage = {
      id: `${id}-reply`,
      role: "assistant",
      content: "",
      createdAt: now + 1,
      status: "loading"
    };

    set((state) => ({
      messages: [...state.messages, userMessage, placeholder],
      sending: true
    }));

    try {
      await delay(700 + Math.random() * 800);
      const details = attachments.length
        ? `\n\nI detected ${attachments
            .map((file) => `${file.name} (${(file.size / 1024).toFixed(1)}KB)`) 
            .join(", "
          )}.`
        : "";
      const synthetic = `Here's a structured draft based on your request:\n\n1. **Intent** → ${
        trimmed || "Analyse attachments"
      }\n2. **Next best step** → I can route this to the secure reasoning engine.${details}\n\n> _Replace this mock reply with a live Nexus.ai response._`;

      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === placeholder.id
            ? { ...msg, content: synthetic, status: "ready" }
            : msg
        ),
        sending: false
      }));
    } catch (err) {
      console.error(err);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === placeholder.id
            ? {
                ...msg,
                content: "Something went wrong. Please retry in a moment.",
                status: "error"
              }
            : msg
        ),
        sending: false
      }));
    }
  },
  reset() {
    set({ messages: [intro], sending: false });
  }
}));
