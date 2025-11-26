import { describe, expect, it } from "vitest";

import { useToronSessionStore } from "@/state/toron/toronSessionStore";

describe("toron session store", () => {
  it("provides default shapes", () => {
    const state = useToronSessionStore.getState();
    expect(state.sessions).toEqual({});
    expect(state.activeSessionId).toBeNull();
  });

  it("handles selectSession safely", () => {
    useToronSessionStore.setState({ sessions: {}, activeSessionId: null });
    expect(() => useToronSessionStore.getState().selectSession(null)).not.toThrow();
  });
});
