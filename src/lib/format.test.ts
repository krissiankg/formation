import { describe, expect, it } from "vitest";
import { formatFcfa } from "./format";

describe("formatFcfa", () => {
  it("never lets the amount and FCFA split across two lines", () => {
    const label = formatFcfa(2500);
    expect(label).toMatch(/^2.500 FCFA$/);
    expect(label).not.toMatch(/ /);
  });

  it("keeps large amounts on one line", () => {
    expect(formatFcfa(80_000)).not.toMatch(/ /);
  });
});
