import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import type { ToronSession } from "@/state/toron/toronSessionTypes";

const malformedSession: ToronSession = {
  sessionId: "x",
  title: "",
  messages: [
    // missing id and content
    { id: "", role: "assistant", content: "", model: "", timestamp: "invalid" },
  ],
};

describe("ToronMessageList", () => {
  it("shows fallback when messages malformed", () => {
    render(<ToronMessageList session={malformedSession} />);
    expect(screen.getByTestId("toron-message-bubble")).toBeInTheDocument();
  });

  it("shows welcome when no session", () => {
    render(<ToronMessageList session={null} />);
    expect(screen.getByText(/welcome to toron/i)).toBeInTheDocument();
  });
});
