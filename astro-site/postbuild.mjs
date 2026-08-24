// Astro's build output uses content-hashed filenames (e.g. index.CMLxwAmL.css),
// which change on every build. The PHP pages (php-backend/index.php,
// admin/*.php) need a STABLE path to link against, so this copies the
// compiled CSS/JS bundle to fixed names under dist/assets/.
import { readdirSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const astroDir = "dist/_astro";
const outDir = "dist/assets";
mkdirSync(outDir, { recursive: true });

const files = readdirSync(astroDir);
const css = files.find((f) => f.endsWith(".css"));
const js = files.find((f) => f.startsWith("Base.astro_astro_type_script") && f.endsWith(".js"));

if (!css) throw new Error("postbuild: no compiled CSS file found in dist/_astro");
if (!js) throw new Error("postbuild: no compiled effects.ts bundle found in dist/_astro");

copyFileSync(join(astroDir, css), join(outDir, "site.css"));
copyFileSync(join(astroDir, js), join(outDir, "site.js"));

console.log(`✔ postbuild: dist/assets/site.css <- ${css}`);
console.log(`✔ postbuild: dist/assets/site.js  <- ${js}`);
