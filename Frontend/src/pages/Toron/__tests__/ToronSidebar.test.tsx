import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { useToronStore } from "@/state/toron/toronStore";

describe("ToronSessionSidebar", () => {
  beforeEach(() => {
    act(() => {
      useToronStore.setState({
        sessions: [
          {
            sessionId: "a",
            title: "First",
            createdAt: "2020-01-01T00:00:00.000Z",
            updatedAt: "2020-01-02T00:00:00.000Z",
            titleAutoLocked: false,
            firstMessageTitle: null,
            messages: [],
          },
          {
            sessionId: "b",
            title: "",
            createdAt: undefined,
            updatedAt: undefined,
            titleAutoLocked: false,
            firstMessageTitle: null,
            messages: [],
          },
        ],
        activeSessionId: "a",
        createSession: () => "",
        switchSession: () => {},
        deleteSession: () => {},
        renameSession: () => {},
        addMessage: () => {},
        getActiveSession: () => null,
      });
    });
  });

  afterEach(() => {
    act(() => {
      useToronStore.setState({ sessions: [], activeSessionId: null });
    });
  });

  it("renders sessions safely", () => {
    render(<ToronSessionSidebar />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Untitled Session")).toBeInTheDocument();
  });
});
