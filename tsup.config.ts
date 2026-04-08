import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  minify: true,
  clean: true,
  splitting: false,
  target: "es2019",
  outDir: "dist"
});
