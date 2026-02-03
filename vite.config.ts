import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    sourcemap: true,
    copyPublicDir: false,
    cssCodeSplit: true,
    minify: "esbuild",
    rollupOptions: {
      input: {
        index: "src/index.ts",
        style: "src/style.css",
      },
      output: {
        compact: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes("style.css")) return "index.css";
          return "assets/[name][extname]";
        },
      },
    },
  },
});
