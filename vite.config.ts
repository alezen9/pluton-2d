import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    sourcemap: false,
    copyPublicDir: false,
    cssCodeSplit: true,
    cssMinify: "esbuild",
    minify: "esbuild",
    rollupOptions: {
      // Keep only the TS entry. Import CSS from src/index.ts instead.
      input: {
        index: "src/index.ts",
        style: "src/style.css",
      },
      output: {
        compact: true,
        assetFileNames: (assetInfo) => {
          // Vite usually names it style.css for lib builds; map it to index.css.
          if (assetInfo.names?.includes("style.css")) return "index.css";
          return "assets/[name][extname]";
        },
      },
    },
  },

  plugins: [
    dts({
      entryRoot: "src",
      outDir: "dist",
      rollupTypes: true,
      insertTypesEntry: true,
      // optional, but often helps avoid bundling internal test/story files
      exclude: ["**/*.test.*", "**/*.spec.*", "**/*.stories.*", "docs/**"],
    }),
  ],
});
