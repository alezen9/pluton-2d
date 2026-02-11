import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://pluton-2d.aleksandargjoreski.dev",
  base: "/",
  devToolbar: { enabled: false },
  integrations: [svelte(), mdx(), pagefind(), sitemap()],
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
        "@root/package.json": path.resolve(__dirname, "../package.json"),
      },
    },
  },
});
