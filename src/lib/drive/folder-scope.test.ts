import { describe, expect, it, vi } from "vitest";
import { createDriveFolderScope, isWithinDriveFolders, type FolderPage } from "./folder-scope";

describe("périmètre des dossiers Drive autorisés", () => {
  it("parcourt les sous-dossiers et leur pagination sans visiter deux fois un dossier", async () => {
    const list = vi.fn()
      .mockResolvedValueOnce({ files: [{ id: "child" }], nextPageToken: "suite" })
      .mockResolvedValueOnce({ files: [{ id: "child" }, { id: "root" }] })
      .mockResolvedValueOnce({ files: [{ id: "nested" }] })
      .mockResolvedValueOnce({ files: [] });
    const scope = createDriveFolderScope(["root"], list);
    const partial = await scope.advance();
    expect(partial.isComplete).toBe(false);
    const result = await scope.advance();
    expect(result).toMatchObject({ folderIds: ["root", "child", "nested"], isComplete: true, error: null });
    expect(list.mock.calls).toEqual([
      [["root"], undefined], [["root"], "suite"], [["child"], undefined], [["nested"], undefined],
    ]);
  });

  it("poursuit un gros arbre entre les requêtes et réutilise le résultat terminé", async () => {
    const list = vi.fn()
      .mockResolvedValueOnce({ files: [{ id: "child" }] })
      .mockResolvedValueOnce({ files: [] });
    const scope = createDriveFolderScope(["root"], list, { maxPages: 1 });
    expect((await scope.advance()).isComplete).toBe(false);
    expect((await scope.advance()).isComplete).toBe(true);
    await scope.advance();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("partage le même lot entre les requêtes simultanées", async () => {
    let finish!: (page: FolderPage) => void;
    const list = vi.fn(() => new Promise<FolderPage>((resolve) => { finish = resolve; }));
    const scope = createDriveFolderScope(["root"], list);
    const first = scope.advance();
    const second = scope.advance();
    finish({ files: [] });
    expect(await first).toEqual(await second);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("signale un dossier inaccessible puis permet de réessayer explicitement", async () => {
    const list = vi.fn()
      .mockRejectedValueOnce(new Error("Partage manquant"))
      .mockResolvedValueOnce({ files: [] });
    const scope = createDriveFolderScope(["root"], list);
    const failed = await scope.advance();
    expect(failed).toMatchObject({ isComplete: false, error: "Partage manquant" });
    await scope.advance();
    expect(list).toHaveBeenCalledTimes(1);
    const retried = await scope.advance(true);
    expect(retried).toMatchObject({ isComplete: true, error: null });
    expect(retried.generation).not.toBe(failed.generation);
  });

  it("ne présente pas une exploration Google partielle comme un inventaire complet", async () => {
    const scope = createDriveFolderScope(["root"], vi.fn().mockResolvedValue({ incompleteSearch: true }));
    expect(await scope.advance()).toMatchObject({ isComplete: false, error: expect.stringContaining("tous les sous-dossiers") });
  });

  it("autorise un fichier direct ou imbriqué dans la racine explicitement autorisée", async () => {
    const parents = vi.fn().mockResolvedValue(["root"]);
    expect(await isWithinDriveFolders(["root"], ["root"], parents)).toBe(true);
    expect(parents).not.toHaveBeenCalled();
    expect(await isWithinDriveFolders(["nested"], ["root"], parents)).toBe(true);
    expect(parents).toHaveBeenCalledWith("nested");
  });

  it("refuse un dossier voisin, une branche inaccessible ou un cycle d'ascendance", async () => {
    expect(await isWithinDriveFolders(["private"], ["root"], async () => [])).toBe(false);
    expect(await isWithinDriveFolders(["private"], ["root"], async () => { throw new Error("Interdit"); })).toBe(false);
    const cycle = vi.fn(async () => ["cycle"]);
    expect(await isWithinDriveFolders(["cycle"], ["root"], cycle)).toBe(false);
    expect(cycle).toHaveBeenCalledTimes(1);
  });
});
