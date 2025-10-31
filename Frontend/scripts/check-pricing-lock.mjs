import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const pricingFile = path.join(rootDir, "src", "features", "pricing", "PricingPage.tsx");
const lockFile = path.join(rootDir, "config", "pricing.lock.json");

const pricingSource = fs.readFileSync(pricingFile, "utf8");
const lock = JSON.parse(fs.readFileSync(lockFile, "utf8"));

const versionMatch = pricingSource.match(/export const PRICING_VERSION = "([^"]+)" as const;/);
const pricesMatch = pricingSource.match(/export const PRICES = Object.freeze\((\{[\s\S]*?\})\);/);

if (!versionMatch || !pricesMatch) {
  console.error("Unable to parse PricingPage.tsx for version or prices.");
  process.exit(1);
}

const sourceVersion = versionMatch[1];
const sourcePrices = Function(`return (${pricesMatch[1]})`)();

const diffMessages = [];

if (sourceVersion !== lock.version) {
  diffMessages.push(`Version mismatch: source=${sourceVersion} lock=${lock.version}`);
}

const planKeys = new Set([...Object.keys(sourcePrices), ...Object.keys(lock.prices)]);

for (const key of planKeys) {
  const sourcePlan = sourcePrices[key];
  const lockPlan = lock.prices[key];
  if (!sourcePlan || !lockPlan) {
    diffMessages.push(`Plan ${key} missing in ${!sourcePlan ? "source" : "lock"}`);
    continue;
  }
  const cycles = new Set([...Object.keys(sourcePlan), ...Object.keys(lockPlan)]);
  for (const cycle of cycles) {
    const sourceValue = sourcePlan[cycle];
    const lockValue = lockPlan[cycle];
    if (sourceValue !== lockValue) {
      diffMessages.push(`Mismatch for ${key}.${cycle}: source=${sourceValue} lock=${lockValue}`);
    }
  }
}

if (diffMessages.length > 0) {
  console.error("Pricing lock mismatch detected:\n" + diffMessages.join("\n"));
  process.exit(1);
}

console.log("Pricing lock verified.");
