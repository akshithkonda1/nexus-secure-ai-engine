import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div>Nexus content</div>} />
          <Route path="chat" element={<div>Chat surface</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
});

describe("Layout", () => {
  it("renders the global chrome", () => {
    const { container } = renderWithRouter();
    expect(screen.getByText(/Skip to content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/User controls/i)).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("toggles the theme from the user bar", () => {
    renderWithRouter();
    const themeButton = screen.getByRole("button", { name: /activate light mode/i });
    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(themeButton);
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("opens and closes the mobile navigation", () => {
    renderWithRouter();
    const menuButton = screen.getByRole("button", { name: /open navigation/i });
    expect(document.body.style.overflow).toBe("");
    fireEvent.click(menuButton);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });
});
