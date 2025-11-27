import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { useToronStore } from "@/state/toron/toronStore";

describe("ToronSessionSidebar", () => {
  beforeEach(() => {
    useToronStore.setState({
      sessions: [
        {
          sessionId: "a",
          title: "First",
          createdAt: "2020-01-01T00:00:00.000Z",
          updatedAt: "2020-01-02T00:00:00.000Z",
          messages: [],
        },
        {
          sessionId: "b",
          title: "",
          createdAt: undefined,
          updatedAt: undefined,
          messages: [],
        },
      ],
      activeSessionId: "a",
      createSession: () => "", 
      switchSession: () => {},
      deleteSession: () => {},
      addMessage: () => {},
      getActiveSession: () => null,
    });
  });

  afterEach(() => {
    useToronStore.setState({ sessions: [], activeSessionId: null });
  });

  it("renders sessions safely", () => {
    render(<ToronSessionSidebar />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Untitled Session")).toBeInTheDocument();
  });
});
