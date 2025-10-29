import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pricingFile = path.join(root, "src/features/pricing/PricingPage.tsx");
const lockFile = path.join(root, "config/pricing.lock.json");

const pricingSource = fs.readFileSync(pricingFile, "utf8");
const versionMatch = pricingSource.match(/PRICING_VERSION\s*=\s*"([^"]+)"/);
const pricesMatch = pricingSource.match(/PRICES\s*=\s*object\.freeze\((\{[\s\S]*?\})\)/i);

if (!versionMatch || !pricesMatch) {
  console.error("Unable to parse pricing constants from PricingPage.tsx");
  process.exit(1);
}

const sandbox = {};
const script = new vm.Script(`result = ${pricesMatch[1]}`);
script.runInNewContext(sandbox);
const tsPrices = sandbox.result;
const tsVersion = versionMatch[1];

const lock = JSON.parse(fs.readFileSync(lockFile, "utf8"));

const diff = [];
if (lock.version !== tsVersion) {
  diff.push(`version mismatch: ts=${tsVersion} lock=${lock.version}`);
}

const compare = (pathKeys, tsValue, lockValue) => {
  if (typeof tsValue !== typeof lockValue) {
    diff.push(`type mismatch at ${pathKeys.join(".")}`);
    return;
  }
  if (typeof tsValue === "object" && tsValue !== null) {
    for (const key of Object.keys(tsValue)) {
      if (!(key in lockValue)) {
        diff.push(`missing key ${[...pathKeys, key].join(".")}`);
      } else {
        compare([...pathKeys, key], tsValue[key], lockValue[key]);
      }
    }
    for (const key of Object.keys(lockValue)) {
      if (!(key in tsValue)) {
        diff.push(`unexpected key ${[...pathKeys, key].join(".")}`);
      }
    }
  } else if (tsValue !== lockValue) {
    diff.push(`value mismatch at ${pathKeys.join(".")}: ${tsValue} !== ${lockValue}`);
  }
};

compare(["prices"], tsPrices, lock.prices);

if (diff.length > 0) {
  console.error("Pricing lock mismatch:\n" + diff.join("\n"));
  process.exit(1);
}

console.log("Pricing lock verified.");
