import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { copyTemplate, TEMPLATES } from "./templates";

const ROOT = join(__dirname, "..", "templates");

describe("templates", () => {
  it("lists the 3 training projects", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(["landing", "site", "saas"]);
    expect(TEMPLATES[0].label).toBe("Projet 1 — Landing page (UI8 / Figma)");
  });

  it("copies a template into an empty folder", async () => {
    const target = mkdtempSync(join(tmpdir(), "projet-"));
    const files = await copyTemplate("landing", ROOT, target);
    expect(files).toEqual(expect.arrayContaining(["AGENTS.md", "BRIEF.md", "index.html"]));
    expect(readdirSync(target)).toEqual(expect.arrayContaining(["AGENTS.md", "index.html"]));
  });

  it("refuses a folder that is not empty", async () => {
    const target = mkdtempSync(join(tmpdir(), "projet-"));
    writeFileSync(join(target, "deja.txt"), "x");
    await expect(copyTemplate("site", ROOT, target)).rejects.toThrow("Le dossier doit être vide");
  });

  it("every template has ADAPT rules and a brief", () => {
    for (const t of TEMPLATES) {
      expect(readdirSync(join(ROOT, t.id))).toEqual(expect.arrayContaining(["AGENTS.md", "BRIEF.md"]));
    }
  });
});
