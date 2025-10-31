import { test, expect } from "@playwright/test";

test("audit and encryption exports download JSON", async ({ page }) => {
  await page.goto("/system?tab=audit");

  const auditPanel = page.getByRole("tabpanel", { name: "Audit Trail" });
  const auditDownloadPromise = page.waitForEvent("download");
  await auditPanel.getByRole("button", { name: "Export JSON" }).click();
  const auditDownload = await auditDownloadPromise;
  expect(auditDownload.suggestedFilename()).toContain("nexus-audit");

  await page.getByRole("tab", { name: "Encryption" }).click();
  const encryptionPanel = page.getByRole("tabpanel", { name: "Encryption" });
  const encryptionDownloadPromise = page.waitForEvent("download");
  await encryptionPanel.getByRole("button", { name: "Export JSON" }).click();
  const encryptionDownload = await encryptionDownloadPromise;
  expect(encryptionDownload.suggestedFilename()).toContain("nexus-encryption");
});
