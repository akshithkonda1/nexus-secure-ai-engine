import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WorkspacePage from "../../pages/Workspace";
import { ThemeProvider } from "../../theme/ThemeProvider";

function renderWorkspace() {
  render(
    <MemoryRouter initialEntries={["/workspace"]}>
      <ThemeProvider>
        <WorkspacePage />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("Workspace interactions", () => {
  it("switches center canvas mode via bottom bar", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { level: 1, name: /Pages/i })).toBeInTheDocument();

    const notesTab = screen.getByRole("button", { name: /Notes mode/i });
    fireEvent.click(notesTab);

    expect(screen.getByRole("heading", { level: 1, name: /Notes/i })).toBeInTheDocument();
  });

  it("keeps canvas mode when interacting with widgets", () => {
    renderWorkspace();

    const initial = screen.getByRole("heading", { level: 1, name: /Pages/i });
    const backlogButton = screen.getAllByRole("button", { name: /Backlog/i })[0];

    fireEvent.click(backlogButton);

    expect(initial).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /Pages/i })).toBeInTheDocument();
  });

  it("renders all widgets without crashing", () => {
    renderWorkspace();

    expect(screen.getAllByLabelText(/Lists widget/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/Calendar widget/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/Connectors widget/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText(/Tasks widget/i).length).toBeGreaterThanOrEqual(1);
  });
});
