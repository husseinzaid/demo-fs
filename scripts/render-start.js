#!/usr/bin/env node
/**
 * Render.com start script for Next.js standalone.
 * Copies public + .next/static into standalone, then runs the server
 * so static assets get correct MIME types (fixes chunk/font load errors).
 */
const { cpSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const { spawn } = require("child_process");

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const standaloneNext = join(standalone, ".next");

if (!existsSync(standalone)) {
  console.error("Missing .next/standalone. Run 'npm run build' first.");
  process.exit(1);
}

if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
}
if (existsSync(join(root, ".next", "static"))) {
  if (!existsSync(standaloneNext)) mkdirSync(standaloneNext, { recursive: true });
  cpSync(join(root, ".next", "static"), join(standaloneNext, "static"), { recursive: true });
}

const child = spawn(process.execPath, ["server.js"], {
  stdio: "inherit",
  env: { ...process.env, PORT: process.env.PORT || "3000" },
  cwd: standalone,
});
child.on("exit", (code) => process.exit(code ?? 0));
