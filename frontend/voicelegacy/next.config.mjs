import path from "node:path";
import { fileURLToPath } from "node:url";

// npm hoists `next` to the workspace root (`frontend/`), not this package
// (`voicelegacy/`). Match Turbopack’s filesystem root to that directory.
const workspaceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(workspaceRoot),
  },
};

export default nextConfig;
