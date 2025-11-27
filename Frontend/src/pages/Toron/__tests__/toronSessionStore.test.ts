import { describe, expect, it } from "vitest";

import { useToronStore } from "@/state/toron/toronStore";

describe("toron session store", () => {
  it("provides default shapes", () => {
    const state = useToronStore.getState();
    expect(state.sessions).toEqual([]);
    expect(state.activeSessionId).toBeNull();
  });

  it("handles switchSession safely", () => {
    useToronStore.setState({ sessions: [], activeSessionId: null });
    expect(() => useToronStore.getState().switchSession("missing")).not.toThrow();
  });

  it("auto-generates a title for the first user message", () => {
    useToronStore.setState({ sessions: [], activeSessionId: null });
    const id = useToronStore.getState().createSession();
    useToronStore.getState().switchSession(id);
    useToronStore.getState().addMessage({
      id: "msg-1",
      role: "user",
      content: "an example prompt to capture",
      model: "user",
      timestamp: new Date().toISOString(),
    });
    const session = useToronStore.getState().getActiveSession();
    expect(session?.titleAutoLocked).toBe(true);
    expect(session?.title).toContain("An Example Prompt");
  });
});
