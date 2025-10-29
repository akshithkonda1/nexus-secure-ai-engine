import { expect, test } from "@playwright/test";

test("limits json exposes caps", async ({ request }) => {
  const response = await request.get("/src/config/limits.json");
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  expect(data.academic.studyCreditsPerDay).toBe(40);
  expect(data.academic.cardsPerDeck).toBe(100);
  expect(data.premium.priority).toBe(true);
  expect(data.pro.teamSeatsMin).toBe(3);
});
