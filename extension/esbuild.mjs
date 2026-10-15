import * as esbuild from "esbuild";
import { buildOptions } from "./build-options.mjs";

const watch = process.argv.includes("--watch");
const options = { ...buildOptions, minify: !watch, sourcemap: watch ? "inline" : false };

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
