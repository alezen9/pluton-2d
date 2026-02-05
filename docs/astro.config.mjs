import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://alezen9.github.io",
  base: "/pluton-2d",
  devToolbar: { enabled: false },
  integrations: [svelte(), mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
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
