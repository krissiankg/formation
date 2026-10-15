import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FORGEIA_CODE_DOWNLOAD_PATH, FORGEIA_CODE_VERSION } from "@/lib/ia/extension-info";

describe("FORGEIA CODE version", () => {
  it("matches extension/package.json", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "extension", "package.json"), "utf8"));
    expect(FORGEIA_CODE_VERSION).toBe(pkg.version);
  });

  it("points to the vsix built by CI", () => {
    expect(FORGEIA_CODE_DOWNLOAD_PATH).toBe(`/downloads/forgeia-code-${FORGEIA_CODE_VERSION}.vsix`);
  });
});
