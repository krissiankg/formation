import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));

describe("manifest", () => {
  it("forgeia.siteUrl cannot be overridden by a workspace (would leak the student key)", () => {
    expect(manifest.contributes.configuration.properties["forgeia.siteUrl"].scope).toBe("application");
  });
});
