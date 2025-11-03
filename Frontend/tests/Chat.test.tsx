import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { axiosInstance } = vi.hoisted(() => ({
  axiosInstance: { post: vi.fn() },
}));

vi.mock("axios", () => ({
  __esModule: true,
  default: {
    create: () => axiosInstance,
  },
}));
import Chat from "@/pages/Chat";
import { useDebateStore } from "@/stores/debateStore";

const initialState = useDebateStore.getState();

describe("Chat page", () => {
  beforeEach(() => {
    useDebateStore.setState({
      ...initialState,
      query: "",
      responses: [],
      consensus: "",
      overallScore: null,
      loading: false,
      error: null,
      queryCount: 0,
      history: [],
      telemetryOptIn: false,
    });
    axiosInstance!.post.mockReset();
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      window.localStorage.setItem("nexus.telemetryConsentAck", "true");
      window.localStorage.setItem("nexus.telemetryOptIn", "false");
    }
  });

  afterEach(() => {
    useDebateStore.setState({ ...initialState });
  });

  it("renders the beta banner", () => {
    render(<Chat />);
    expect(screen.getByText(/Unlimited Beta/i)).toBeInTheDocument();
  });

  it("shows loading skeleton when submitting", async () => {
    axiosInstance!.post.mockResolvedValueOnce({
      data: { responses: [], consensus: "", overall_score: 0 },
    });
    render(<Chat />);
    const textarea = screen.getByLabelText(/ask nexus.ai/i);
    fireEvent.change(textarea, { target: { value: "Test question" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(() => expect(axiosInstance!.post).toHaveBeenCalled());
  });

  it("renders responses after a successful query", async () => {
    axiosInstance!.post.mockResolvedValueOnce({
      data: {
        responses: [
          { model: "GPT-4o", text: "Here is a reference https://example.com", score: 0.92 },
        ],
        consensus: "Synthesized answer",
        overall_score: 0.88,
      },
    });

    render(<Chat />);
    const textarea = screen.getByLabelText(/ask nexus.ai/i);
    fireEvent.change(textarea, { target: { value: "What is Nexus" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(screen.getByText(/Synthesized answer/)).toBeInTheDocument());
    expect(screen.getByText(/GPT-4o/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /https:\/\/example.com/ })).toHaveAttribute("target", "_blank");
  });
});
