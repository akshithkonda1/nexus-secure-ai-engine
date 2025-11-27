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
});
