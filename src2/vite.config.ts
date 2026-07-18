import { defineConfig } from "vite-plus";
import { resolve } from "path";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  build: {
    lib:{
        entry: resolve(__dirname, "src/index.js"),
        formats: ["es"],
        fileName: "index"
    },
    outDir: "public/dist",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: true,
  }
});
