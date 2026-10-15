import { beforeAll, describe, expect, it } from "vitest";
import { createIaLinkToken, readIaLinkToken } from "@/lib/ia/link-token";

const ID = "c67e4dec-6def-4a0d-9f18-59983c57b5fc";
const OTHER = "11111111-2222-4333-8444-555555555555";
const NOW = 1_790_000_000_000;

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "secret-de-test";
});

describe("IA link token", () => {
  it("round-trips the enrollment id", () => {
    expect(readIaLinkToken(createIaLinkToken(ID, NOW), NOW + 60_000)).toBe(ID);
  });

  it("expires after 10 minutes", () => {
    expect(readIaLinkToken(createIaLinkToken(ID, NOW), NOW + 11 * 60_000)).toBeNull();
  });

  it("rejects an altered signature", () => {
    const token = createIaLinkToken(ID, NOW);
    const altered = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(readIaLinkToken(altered, NOW)).toBeNull();
  });

  it("rejects a token whose id was swapped for another student", () => {
    expect(readIaLinkToken(createIaLinkToken(ID, NOW).replace(ID, OTHER), NOW)).toBeNull();
  });

  it("rejects a student session token", () => {
    expect(readIaLinkToken(`student:${ID}:${NOW / 1000 + 600}.abc`, NOW)).toBeNull();
  });
});
