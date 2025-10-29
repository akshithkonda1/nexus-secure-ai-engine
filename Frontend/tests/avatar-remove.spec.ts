import { test, expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/Pq7ZlwAAAABJRU5ErkJggg==",
  "base64",
);

test("avatar can be removed to restore default", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();

  const filePath = path.join(testInfo.outputDir, "tiny.png");
  await fs.mkdir(testInfo.outputDir, { recursive: true });
  await fs.writeFile(filePath, tinyPng);
  await page.setInputFiles("#avatar-upload", filePath);
  await expect(page.getByText("Photo ready. Save to keep your new avatar.")).toBeVisible();

  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByText("Avatar will be removed on save.")).toBeVisible();
});
