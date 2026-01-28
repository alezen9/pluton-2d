import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    // dev server serves from examples
    return {
      root: "examples",
    };
  } else {
    // build produces library from src
    return {
      build: {
        lib: {
          entry: "src/index.ts",
          formats: ["es"],
          fileName: "index",
        },
        sourcemap: true,
        copyPublicDir: false,
        minify: "esbuild",
        rollupOptions: {
          output: {
            compact: true,
          },
        },
      },
    };
  }
});
