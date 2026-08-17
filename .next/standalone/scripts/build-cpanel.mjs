import { cpSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const build = spawnSync(npx, ["next", "build"], { stdio: "inherit", shell: process.platform === "win32" });
if (build.status !== 0) process.exit(build.status ?? 1);

const staticDest = ".next/standalone/.next/static";
rmSync(staticDest, { recursive: true, force: true });
cpSync(".next/static", staticDest, { recursive: true });

cpSync("public", ".next/standalone/public", { recursive: true });
rmSync(".next/standalone/public/uploads", { recursive: true, force: true });

console.log("✔ cPanel build ready at .next/standalone — run `node server.js`");
