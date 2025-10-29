import { expect, test } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";

const SMALL_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgQf7I94AAAAASUVORK5CYII=";

async function createTempAvatar(testName: string) {
  const filePath = path.join(process.cwd(), `.playwright-${testName}-avatar.png`);
  await fs.writeFile(filePath, Buffer.from(SMALL_PNG, "base64"));
  return filePath;
}

test("avatar can be uploaded and removed", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.locator('button:has-text("Profile")').click();
  const dialog = page.getByRole("dialog", { name: "Edit profile" });
  await expect(dialog).toBeVisible();

  const avatarPath = await createTempAvatar(testInfo.title.replace(/\s+/g, "-"));
  await page.setInputFiles("#profile-avatar-input", avatarPath);
  await expect(page.locator("text=Photo ready. Save to keep your new avatar.")).toBeVisible();

  await page.locator('button:has-text("Remove photo")').click();
  await expect(page.locator("text=Photo ready. Save to keep your new avatar.")).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
});
