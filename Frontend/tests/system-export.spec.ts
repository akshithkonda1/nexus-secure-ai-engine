import { test, expect } from "@playwright/test";

test("audit and encryption exports trigger downloads", async ({ page }) => {
  await page.goto("/system");
  await page.getByRole("tab", { name: "Audit Trail" }).click();
  const auditDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const auditFile = await auditDownload;
  await expect(auditFile.suggestedFilename()).toContain("audit-trail");

  await page.getByRole("tab", { name: "Encryption" }).click();
  const encryptionDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const encFile = await encryptionDownload;
  await expect(encFile.suggestedFilename()).toContain("encryption-posture");
});
