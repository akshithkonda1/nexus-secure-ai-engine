import { useEffect } from "react";

export type RyuzenCommand =
  | { type: "prompt:new" }
  | { type: "notifications:open" }
  | { type: "project:create"; payload?: { name?: string } }
  | { type: "project:open"; payload: { id: string } }
  | { type: "billing:upgrade" }
  | { type: "documents:view"; payload?: { filter?: string } }
  | { type: "auth:signOut" }
  | { type: "profile:open" };

const EVENT_NAME = "ryuzen:command";

declare global {
  interface WindowEventMap {
    [EVENT_NAME]: CustomEvent<RyuzenCommand>;
  }
}

export function emitCommand(command: RyuzenCommand) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: command }));
}

export function useCommand(handler: (command: RyuzenCommand) => void) {
  useEffect(() => {
    const listener = (event: WindowEventMap[typeof EVENT_NAME]) => {
      handler(event.detail);
    };
    window.addEventListener(EVENT_NAME, listener as EventListener);
    return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
  }, [handler]);
}

export function requestNewPrompt() {
  emitCommand({ type: "prompt:new" });
}

export function requestNotifications() {
  emitCommand({ type: "notifications:open" });
}

export function requestProjectCreation(name?: string) {
  emitCommand({ type: "project:create", payload: name ? { name } : undefined });
}

export function requestProjectOpen(id: string) {
  emitCommand({ type: "project:open", payload: { id } });
}

export function requestBillingUpgrade() {
  emitCommand({ type: "billing:upgrade" });
}

export function requestDocumentsView(filter?: string) {
  emitCommand({ type: "documents:view", payload: filter ? { filter } : undefined });
}

export function requestSignOut() {
  emitCommand({ type: "auth:signOut" });
}
