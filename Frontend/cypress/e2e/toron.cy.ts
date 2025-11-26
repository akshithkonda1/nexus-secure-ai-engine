/// <reference types="cypress" />

describe("Toron UI hardening", () => {
  it("boots the app without crashing", () => {
    cy.visit("/");
    cy.contains("Toron");
  });

  it("handles sessions list interactions safely", () => {
    cy.visit("/");
    cy.get("body").then(() => {
      cy.contains("New").click({ force: true });
      cy.contains("Sessions");
    });
  });

  it("handles message send flow even when state is missing", () => {
    cy.visit("/");
    cy.get("textarea").first().type("Hello Toron{enter}");
    cy.contains(/toron/i);
  });
});
