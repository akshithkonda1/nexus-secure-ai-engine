import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pricingLockPath = path.join(rootDir, "src", "config", "pricing.lock.json");
const pricingPagePath = path.join(rootDir, "src", "features", "pricing", "PricingPage.tsx");

const lockRaw = await readFile(pricingLockPath, "utf8");
const lockData = JSON.parse(lockRaw);

const pageSource = await readFile(pricingPagePath, "utf8");

const versionMatch = pageSource.match(/export const PRICING_VERSION = "([^"]+)"/);
if (!versionMatch) {
  console.error("Unable to locate PRICING_VERSION in PricingPage.tsx");
  process.exit(1);
}
const pageVersion = versionMatch[1];

const pricesMatch = pageSource.match(/export const PRICES = Object\.freeze\((\{[\s\S]*?\})\);/);
if (!pricesMatch) {
  console.error("Unable to locate PRICES in PricingPage.tsx");
  process.exit(1);
}

let pagePrices;
try {
  pagePrices = Function(`return (${pricesMatch[1]});`)();
} catch (error) {
  console.error("Failed to evaluate PRICES from PricingPage.tsx", error);
  process.exit(1);
}

const diffs = [];

if (lockData.version !== pageVersion) {
  diffs.push(`version mismatch: lock=${lockData.version} page=${pageVersion}`);
}

for (const plan of Object.keys(lockData)) {
  if (plan === "version") continue;
  const lockPlan = lockData[plan];
  const pagePlan = pagePrices[plan];
  if (!pagePlan) {
    diffs.push(`plan missing on page: ${plan}`);
    continue;
  }
  for (const cycle of Object.keys(lockPlan)) {
    const lockValue = Number(lockPlan[cycle]);
    const pageValue = Number(pagePlan[cycle]);
    if (Number.isNaN(lockValue) || Number.isNaN(pageValue)) {
      diffs.push(`non-numeric price for ${plan}.${cycle}`);
      continue;
    }
    if (lockValue !== pageValue) {
      diffs.push(`price mismatch for ${plan}.${cycle}: lock=${lockValue} page=${pageValue}`);
    }
  }
}

if (diffs.length > 0) {
  console.error("Pricing changed without version bump. Update pricing.lock.json and PRICING_VERSION together.\n" + diffs.join("\n"));
  process.exit(1);
}
