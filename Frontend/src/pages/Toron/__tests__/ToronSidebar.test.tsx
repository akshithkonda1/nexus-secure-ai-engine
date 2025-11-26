import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";

describe("ToronSessionSidebar", () => {
  beforeEach(() => {
    useToronSessionStore.setState({
      sessions: {
        a: {
          sessionId: "a",
          title: "First",
          createdAt: "2020-01-01T00:00:00.000Z",
          updatedAt: "2020-01-02T00:00:00.000Z",
          messages: [],
        },
        b: {
          sessionId: "b",
          title: "",
          createdAt: undefined,
          updatedAt: undefined,
          messages: [],
        },
      },
      activeSessionId: "a",
      loading: false,
      error: null,
      hydrateSessions: async () => {},
      selectSession: () => {},
      addMessage: () => {},
      updateTitle: () => {},
      createSession: async () => "",
      deleteSession: async () => {},
    });
  });

  afterEach(() => {
    useToronSessionStore.setState({ sessions: {}, activeSessionId: null });
  });

  it("renders sessions safely", () => {
    render(<ToronSessionSidebar />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Untitled Session")).toBeInTheDocument();
  });
});
