import { afterEach, describe, expect, it, vi } from "vitest";
import { createDriveFileCounter, type DriveCountPage } from "./file-count";

const files = (length: number) => Array.from({ length }, (_, id) => ({ id: String(id) }));

afterEach(() => vi.useRealTimers());

describe("comptage de la collection Google Drive", () => {
  it("compte au-delà de 50 fichiers et parcourt toutes les pages", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(1000), nextPageToken: "suite" })
      .mockResolvedValueOnce({ files: files(375) });
    const counter = createDriveFileCounter(listPage);

    expect(await counter.count()).toEqual({ count: 1375, isComplete: true, incompleteSearch: false });
    expect(listPage.mock.calls).toEqual([[undefined], ["suite"]]);
  });

  it("continue après des pages vides ou courtes tant que Google fournit un curseur", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: [], nextPageToken: "vide" })
      .mockResolvedValueOnce({ files: files(2), nextPageToken: "courte" })
      .mockResolvedValueOnce({ files: files(3) });

    expect(await createDriveFileCounter(listPage).count()).toEqual({
      count: 5, isComplete: true, incompleteSearch: false,
    });
    expect(listPage.mock.calls).toEqual([[undefined], ["vide"], ["courte"]]);
  });

  it("reprend les grandes collections au bon curseur entre plusieurs requêtes", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(1000), nextPageToken: "page2" })
      .mockResolvedValueOnce({ files: files(1000), nextPageToken: "page3" })
      .mockResolvedValueOnce({ files: files(12) });
    const counter = createDriveFileCounter(listPage, { maxPages: 2 });

    expect(await counter.count()).toEqual({ count: 2000, isComplete: false, incompleteSearch: false });
    // Un autre administrateur demandant une actualisation ne recommence pas un scan en cours.
    expect(await counter.count(true)).toEqual({ count: 2012, isComplete: true, incompleteSearch: false });
    expect(listPage.mock.calls).toEqual([[undefined], ["page2"], ["page3"]]);
  });

  it("partage une requête en cours entre les administrateurs sans doubler le compteur", async () => {
    let finish!: (page: DriveCountPage) => void;
    const listPage = vi.fn(() => new Promise<DriveCountPage>((resolve) => { finish = resolve; }));
    const counter = createDriveFileCounter(listPage);
    const first = counter.count();
    const second = counter.count();
    expect(listPage).toHaveBeenCalledTimes(1);
    finish({ files: files(7) });

    expect(await first).toEqual({ count: 7, isComplete: true, incompleteSearch: false });
    expect(await second).toEqual(await first);
  });

  it("réutilise le total récent, puis le recalcule sur demande ou à expiration", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(70) })
      .mockResolvedValueOnce({ files: files(75) })
      .mockResolvedValueOnce({ files: files(80) });
    const counter = createDriveFileCounter(listPage, { cacheTtlMs: 1000 });

    expect((await counter.count()).count).toBe(70);
    expect((await counter.count()).count).toBe(70);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect((await counter.count(true)).count).toBe(75);
    vi.setSystemTime(1001);
    expect((await counter.count()).count).toBe(80);
    expect(listPage.mock.calls).toEqual([[undefined], [undefined], [undefined]]);
  });

  it("ne publie pas un faux total après un échec et recommence avec un nouveau curseur", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(50), nextPageToken: "expire" })
      .mockRejectedValueOnce(new Error("Jeton Google expiré"))
      .mockResolvedValueOnce({ files: files(120) });
    const counter = createDriveFileCounter(listPage);

    await expect(counter.count()).rejects.toThrow("Jeton Google expiré");
    expect(await counter.count()).toEqual({ count: 120, isComplete: true, incompleteSearch: false });
    expect(listPage.mock.calls).toEqual([[undefined], ["expire"], [undefined]]);
  });

  it("conserve l'avertissement de recherche partielle jusqu'à la dernière page", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(50), nextPageToken: "suite", incompleteSearch: true })
      .mockResolvedValueOnce({ files: files(20), incompleteSearch: false });

    expect(await createDriveFileCounter(listPage).count()).toEqual({
      count: 70, isComplete: true, incompleteSearch: true,
    });
  });

  it("rend la main après une page lente puis poursuit sans perdre de fichiers", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const listPage = vi.fn()
      .mockImplementationOnce(async () => {
        vi.setSystemTime(6000);
        return { files: files(1000), nextPageToken: "suite" };
      })
      .mockResolvedValueOnce({ files: files(2) });
    const counter = createDriveFileCounter(listPage);

    expect((await counter.count()).isComplete).toBe(false);
    expect(listPage).toHaveBeenCalledTimes(1);
    expect(await counter.count()).toEqual({ count: 1002, isComplete: true, incompleteSearch: false });
  });

  it("refuse une boucle de pagination au lieu de gonfler le total", async () => {
    const listPage = vi.fn().mockResolvedValue({ files: files(50), nextPageToken: "meme-page" });
    await expect(createDriveFileCounter(listPage).count()).rejects.toThrow("pagination invalide");
    expect(listPage).toHaveBeenCalledTimes(2);
  });

  it("oublie le total lorsqu'un autre compte Google est connecté", async () => {
    const listPage = vi.fn()
      .mockResolvedValueOnce({ files: files(100) })
      .mockResolvedValueOnce({ files: files(200) });
    const counter = createDriveFileCounter(listPage);
    expect((await counter.count()).count).toBe(100);
    counter.clear();
    expect((await counter.count()).count).toBe(200);
  });
});
