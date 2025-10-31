#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pricingPath = path.resolve(__dirname, "../config/pricing.ts");
const lockPath = path.resolve(__dirname, "../src/config/pricing.lock.json");

const pricingSource = fs.readFileSync(pricingPath, "utf8");
const versionMatch = pricingSource.match(/PRICING_VERSION\s*=\s*"([^"]+)"/);
if (!versionMatch) {
  console.error("Unable to parse PRICING_VERSION from pricing.ts");
  process.exit(1);
}
const version = versionMatch[1];

const pricesMatch = pricingSource.match(/Object\.freeze\((\{[\s\S]*?\})\s*as const\);/);
if (!pricesMatch) {
  console.error("Unable to parse PRICES from pricing.ts");
  process.exit(1);
}
const pricesLiteral = pricesMatch[1];
let prices;
try {
  prices = Function(`"use strict";return (${pricesLiteral});`)();
} catch (error) {
  console.error("Failed to evaluate PRICES literal", error);
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

const mismatch = lock.version !== version || JSON.stringify(lock.prices) !== JSON.stringify(prices);
if (mismatch) {
  console.error("pricing.lock.json is out of sync with config/pricing.ts");
  process.exit(1);
}

console.log("Pricing lock is up to date.");
