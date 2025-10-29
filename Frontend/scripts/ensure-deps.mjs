import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requiredPackages = [
  "@hookform/resolvers",
  "react-hook-form",
  "zod",
  "clsx",
  "tailwind-merge",
  "@radix-ui/react-slot",
  "@radix-ui/react-toast",
  "@radix-ui/react-switch",
  "@radix-ui/react-label",
  "@radix-ui/react-avatar",
  "@radix-ui/react-dialog",
  "@radix-ui/react-tabs",
  "class-variance-authority",
  "tailwindcss"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function hasPackage(pkg) {
  const packagePath = path.join(projectRoot, "node_modules", ...pkg.split("/"));
  return existsSync(packagePath);
}

function findMissing() {
  return requiredPackages.filter((pkg) => !hasPackage(pkg));
}

function installDependencies() {
  const result = spawnSync("npm", ["install"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    console.error("\n[ensure-deps] npm install failed. Please run `npm install` manually to continue.\n");
    process.exit(result.status ?? 1);
  }
}

const missingBefore = findMissing();

if (missingBefore.length === 0) {
  process.exit(0);
}

console.log(`\n[ensure-deps] Missing dependencies detected: ${missingBefore.join(", ")}. Installing...\n`);
installDependencies();

const missingAfter = findMissing();

if (missingAfter.length > 0) {
  console.error(`\n[ensure-deps] Unable to install: ${missingAfter.join(", ")}. Please install manually.\n`);
  process.exit(1);
}

console.log("[ensure-deps] Dependencies are ready.\n");
