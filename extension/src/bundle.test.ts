import { build } from "esbuild";
import { describe, expect, it } from "vitest";
// @ts-expect-error module .mjs sans types
import { buildOptions } from "../build-options.mjs";

describe("bundle", () => {
  it("inlines every dependency (no leftover relative require)", async () => {
    const result = await build({ ...buildOptions, write: false, logLevel: "silent" });
    const code = result.outputFiles?.[0]?.text ?? "";
    expect(code).not.toMatch(/require\d*\(["']\.\.?\//);
  }, 60_000);
});
