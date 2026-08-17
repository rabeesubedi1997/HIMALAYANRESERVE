import path from "node:path";

export const UPLOADS_DIR = (() => {
  if (process.env.UPLOADS_DIR) return process.env.UPLOADS_DIR;
  const cwd = process.cwd();
  if (path.basename(cwd) === "standalone") {
    return path.resolve(cwd, "..", "..", "public", "uploads");
  }
  return path.join(cwd, "public", "uploads");
})();
