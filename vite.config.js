import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
  ],
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    include: ["@shopify/shopify-app-remix", "@shopify/polaris"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  esbuild: {
    target: "esnext",
    supported: {
      'import-assertions': true,
    },
  },
});