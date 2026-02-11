import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "../package.json"), "utf-8"),
);

export default defineConfig({
  site: "https://alezen9.github.io",
  base: "/pluton-2d",
  devToolbar: { enabled: false },
  integrations: [svelte(), mdx(), pagefind()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    define: {
      __LIB_VERSION__: JSON.stringify(version),
    },
    resolve: {
      alias: {
        "pluton-2d/style.css": path.resolve(__dirname, "../src/style.css"),
        "pluton-2d": path.resolve(__dirname, "../src/index.ts"),
        "@components": path.resolve(__dirname, "src/components"),
        "@views": path.resolve(__dirname, "src/views"),
      },
    },
  },
});
