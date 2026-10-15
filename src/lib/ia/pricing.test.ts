import { describe, expect, it } from "vitest";
import { computeCostFcfa, estimateUsage, parseUsage } from "@/lib/ia/pricing";

describe("parseUsage", () => {
  it("reads OpenAI-style cached tokens", () => {
    expect(
      parseUsage({ prompt_tokens: 1000, completion_tokens: 50, prompt_tokens_details: { cached_tokens: 800 } }),
    ).toEqual({ promptTokens: 1000, cachedTokens: 800, completionTokens: 50 });
  });

  it("reads DeepSeek-style cache hits", () => {
    expect(parseUsage({ prompt_tokens: 1000, completion_tokens: 50, prompt_cache_hit_tokens: 700 })).toEqual({
      promptTokens: 1000,
      cachedTokens: 700,
      completionTokens: 50,
    });
  });

  it("returns null without usage", () => {
    expect(parseUsage(undefined)).toBeNull();
  });
});

describe("estimateUsage", () => {
  it("counts 4 characters per token, nothing cached", () => {
    expect(estimateUsage(4000, 400)).toEqual({ promptTokens: 1000, cachedTokens: 0, completionTokens: 100 });
  });
});

describe("computeCostFcfa", () => {
  it("charges uncached input at the flash rate (0.30 $/M = 180 F)", () => {
    expect(computeCostFcfa("forgeia-coder", { promptTokens: 1_000_000, cachedTokens: 0, completionTokens: 0 })).toBe(180);
  });

  it("charges cached input at the cache rate (0.006 $/M = 3.6 F)", () => {
    expect(
      computeCostFcfa("deepseek-v4-flash", { promptTokens: 1_000_000, cachedTokens: 1_000_000, completionTokens: 0 }),
    ).toBe(3.6);
  });

  it("charges pro output at 3.96 $/M (2376 F)", () => {
    expect(computeCostFcfa("deepseek-v4-pro", { promptTokens: 0, cachedTokens: 0, completionTokens: 1_000_000 })).toBe(2376);
  });

  it("falls back to the forgeia-coder rates for an unknown alias", () => {
    expect(computeCostFcfa("inconnu", { promptTokens: 1_000_000, cachedTokens: 0, completionTokens: 0 })).toBe(180);
  });
});
