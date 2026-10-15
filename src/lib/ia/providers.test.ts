import { describe, expect, it } from "vitest";
import { getIaProvider } from "@/lib/ia/providers";

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

  it("passes unknown models through unchanged", () => {
    expect(getIaProvider({}).resolveModel("custom/x")).toBe("custom/x");
  });

  it("has no key when the variable is missing or blank", () => {
    expect(getIaProvider({ NVIDIA_API_KEY: "  " }).apiKey).toBeNull();
    expect(getIaProvider({ IA_PROVIDER: "deepseek" }).apiKey).toBeNull();
  });
});
