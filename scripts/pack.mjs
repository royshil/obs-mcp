#!/usr/bin/env node
import { execSync } from "child_process";
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { listTools } from "./list-tools.mjs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const staging = resolve(root, ".pack-staging");

console.log("Preparing staging directory...");

// if (existsSync(staging)) rmSync(staging, { recursive: true });
if (!existsSync(staging)) mkdirSync(staging, {recursive: true});

// Copy only what the extension needs
for (const f of ["package.json", "package-lock.json", "icon.png"]) {
  cpSync(resolve(root, f), resolve(staging, f), { force: true });
}

// Generate tools list from the built server and inject into manifest
console.log("Generating tools list from server...");
const tools = await listTools(root);
const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
manifest.version = version;
manifest.tools = tools;
writeFileSync(resolve(staging, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Found ${tools.length} tools.`);
cpSync(resolve(root, "build"), resolve(staging, "server"), { recursive: true, force: true });

// Install production deps only
console.log("Installing production dependencies...");
execSync("npm install --omit=dev", { cwd: staging, stdio: "inherit" });

// Pack
console.log("Packing...");
execSync(`npm exec -- @anthropic-ai/mcpb pack . ${resolve(root, "dist/obs-studio.mcpb")}`, {
  cwd: staging,
  stdio: "inherit",
});

// Cleanup
// rmSync(staging, { recursive: true });
console.log("Done.");
