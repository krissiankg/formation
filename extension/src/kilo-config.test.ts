import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "jsonc-parser";
import { describe, expect, it } from "vitest";
import {
  applyForgeiaProvider,
  installAdaptAgents,
  kiloConfigPath,
  readDefaultModel,
  setDefaultModel,
  removeForgeiaApiKey,
  writeKiloConfig,
} from "./kilo-config";

const OPTS = { apiKey: "forge_test", baseUrl: "https://ia.guelichweb.store/v1" };
const EMPTY = '{\n  "$schema": "https://app.kilo.ai/config.json"\n}';

describe("applyForgeiaProvider", () => {
  it("adds the provider to an empty config", () => {
    const config = parse(applyForgeiaProvider(EMPTY, OPTS));
    expect(config.$schema).toBe("https://app.kilo.ai/config.json");
    expect(config.provider.forgeia.npm).toBe("@ai-sdk/openai-compatible");
    expect(config.provider.forgeia.options).toEqual({ baseURL: OPTS.baseUrl, apiKey: "forge_test" });
    expect(Object.keys(config.provider.forgeia.models)).toEqual(["forgeia-coder", "deepseek-v4-pro", "kimi-k3"]);
    expect(config.model).toBe("forgeia/forgeia-coder");
  });

  it("preserves comments and other providers", () => {
    const input = `{
  // mon commentaire
  "provider": { "vllm": { "options": { "baseURL": "http://localhost:8000/v1" } } }
}`;
    const output = applyForgeiaProvider(input, OPTS);
    expect(output).toContain("// mon commentaire");
    const config = parse(output);
    expect(config.provider.vllm).toEqual({ options: { baseURL: "http://localhost:8000/v1" } });
    expect(config.provider.forgeia.options.apiKey).toBe("forge_test");
  });

  it("is idempotent", () => {
    const once = applyForgeiaProvider(EMPTY, OPTS);
    expect(applyForgeiaProvider(once, OPTS)).toBe(once);
  });

  it("starts from an empty object when the file is blank", () => {
    expect(parse(applyForgeiaProvider("", OPTS)).model).toBe("forgeia/forgeia-coder");
  });
});

describe("default model", () => {
  it("reads the student's own default model", () => {
    expect(readDefaultModel('{ "model": "anthropic/claude-sonnet" }')).toBe("anthropic/claude-sonnet");
    expect(readDefaultModel(EMPTY)).toBeUndefined();
  });

  it("restores the previous default model on sign-out", () => {
    const signedIn = applyForgeiaProvider(
      `{
  // perso
  "model": "anthropic/claude-sonnet"
}`,
      OPTS,
    );
    expect(parse(signedIn).model).toBe("forgeia/forgeia-coder");
    const restored = setDefaultModel(signedIn, "anthropic/claude-sonnet");
    expect(parse(restored).model).toBe("anthropic/claude-sonnet");
    expect(restored).toContain("// perso");
  });

  it("removes the default model when the student had none", () => {
    expect(parse(setDefaultModel(applyForgeiaProvider(EMPTY, OPTS), undefined)).model).toBeUndefined();
  });
});

describe("removeForgeiaApiKey", () => {
  it("keeps the provider but drops the key", () => {
    const config = parse(removeForgeiaApiKey(applyForgeiaProvider(EMPTY, OPTS)));
    expect(config.provider.forgeia.options.baseURL).toBe(OPTS.baseUrl);
    expect(config.provider.forgeia.options.apiKey).toBeUndefined();
  });
});

describe("files", () => {
  it("prefers an existing kilo.json over kilo.jsonc", () => {
    const home = mkdtempSync(join(tmpdir(), "kilo-"));
    expect(kiloConfigPath(home)).toBe(join(home, ".config", "kilo", "kilo.jsonc"));
    mkdirSync(join(home, ".config", "kilo"), { recursive: true });
    writeFileSync(join(home, ".config", "kilo", "kilo.json"), "{}");
    expect(kiloConfigPath(home)).toBe(join(home, ".config", "kilo", "kilo.json"));
  });

  it("creates the config file when Kilo has never run", async () => {
    const home = mkdtempSync(join(tmpdir(), "kilo-"));
    await writeKiloConfig(home, OPTS);
    const config = parse(readFileSync(join(home, ".config", "kilo", "kilo.jsonc"), "utf8"));
    expect(config.provider.forgeia.options.apiKey).toBe("forge_test");
  });

  it("installs only forgeia-* agents and leaves the student's own agents alone", async () => {
    const home = mkdtempSync(join(tmpdir(), "kilo-"));
    const source = mkdtempSync(join(tmpdir(), "agents-"));
    writeFileSync(join(source, "forgeia-coach.md"), "coach");
    writeFileSync(join(source, "notes.txt"), "pas un agent");
    const agentDir = join(home, ".config", "kilo", "agent");
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(join(agentDir, "mon-agent.md"), "à moi");
    await installAdaptAgents(home, source);
    expect(readdirSync(agentDir).sort()).toEqual(["forgeia-coach.md", "mon-agent.md"]);
    expect(readFileSync(join(agentDir, "mon-agent.md"), "utf8")).toBe("à moi");
  });

  it("does nothing when the agents folder is missing", async () => {
    const home = mkdtempSync(join(tmpdir(), "kilo-"));
    expect(await installAdaptAgents(home, join(home, "absent"))).toEqual([]);
  });
});
