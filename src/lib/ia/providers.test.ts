import { describe, expect, it } from "vitest";
import { getIaProvider, isPublicModel } from "@/lib/ia/providers";

describe("getIaProvider", () => {
  it("defaults to NVIDIA", () => {
    expect(getIaProvider({}).id).toBe("nvidia");
  });

  it("selects DeepSeek with its own key", () => {
    const provider = getIaProvider({ IA_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "k" });
    expect(provider.id).toBe("deepseek");
    expect(provider.apiKey).toBe("k");
    expect(provider.chatUrl).toBe("https://api.deepseek.com/chat/completions");
  });

  it("maps the FORGE IA alias to the NVIDIA model", () => {
    expect(getIaProvider({}).resolveModel("forgeia-coder")).toBe("deepseek-ai/deepseek-v4-flash-0731");
  });

  it("uses DeepSeek V4 model names (deepseek-chat / deepseek-reasoner retired on 2026-07-24)", () => {
    const deepseek = getIaProvider({ IA_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "k" });
    expect(deepseek.resolveModel("forgeia-coder")).toBe("deepseek-v4-flash");
    expect(deepseek.resolveModel("deepseek-chat")).toBe("deepseek-v4-flash");
    expect(deepseek.resolveModel("deepseek-v4-pro")).toBe("deepseek-v4-pro");
  });

  it("passes unknown models through unchanged", () => {
    expect(getIaProvider({}).resolveModel("custom/x")).toBe("custom/x");
  });

  it("has no key when the variable is missing or blank", () => {
    expect(getIaProvider({ NVIDIA_API_KEY: "  " }).apiKey).toBeNull();
    expect(getIaProvider({ IA_PROVIDER: "deepseek" }).apiKey).toBeNull();
  });
});

describe("isPublicModel", () => {
  it("accepts only the FORGE IA aliases", () => {
    expect(isPublicModel("forgeia-coder")).toBe(true);
    expect(isPublicModel("deepseek-v4-pro")).toBe(true);
    expect(isPublicModel("deepseek-reasoner")).toBe(false);
    expect(isPublicModel("deepseek-ai/deepseek-v4-pro-0813")).toBe(false);
    expect(isPublicModel("")).toBe(false);
  });
});
