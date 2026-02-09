import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const fixtureRoot = path.resolve(projectRoot, "e2e/fixture");

export default defineConfig({
  root: fixtureRoot,
  resolve: {
    alias: {
      "pluton-2d": path.resolve(projectRoot, "src/index.ts"),
      "pluton-2d/style.css": path.resolve(projectRoot, "src/style.css"),
    },
  },
  server: {
    host: "localhost",
    port: 4173,
    strictPort: true,
    fs: {
      allow: [projectRoot],
    },
  },
});
