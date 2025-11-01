import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import WelcomeHub from "./WelcomeHub";

describe("WelcomeHub action chips", () => {
  it("render as links with the expected destinations", () => {
    render(
      <MemoryRouter>
        <WelcomeHub />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Write copy" })).toHaveAttribute(
      "href",
      "/chat/new?preset=copy"
    );
    expect(screen.getByRole("link", { name: "Image generation" })).toHaveAttribute(
      "href",
      "/chat/new?preset=image"
    );
    expect(screen.getByRole("link", { name: "Create avatar" })).toHaveAttribute(
      "href",
      "/chat/new?preset=avatar"
    );
    expect(screen.getByRole("link", { name: "Write code" })).toHaveAttribute(
      "href",
      "/chat/new?preset=code"
    );
  });
});
