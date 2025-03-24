import packageJson from "./package.json";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: packageJson.name,
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["@permaweb/aoconnect"],
      output: {
        globals: {
          "@permaweb/aoconnect": "aoconnect"
        }
      }
    }
  }
});