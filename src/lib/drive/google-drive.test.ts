import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Les tests utilisent un compte fictif et n'accèdent à aucun jeton local ou de production.
vi.mock("node:fs", () => ({ default: {
  existsSync: vi.fn(() => false), readFileSync: vi.fn(), mkdirSync: vi.fn(), writeFileSync: vi.fn(),
} }));
vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseAdmin: () => ({ from: () => ({ select: () => ({ eq: () => ({
    maybeSingle: async () => ({ data: { value: {
      refreshToken: "test-refresh", accessToken: "test-access", expiresAt: Number.MAX_SAFE_INTEGER,
    } }, error: null }),
  }) }) }) }),
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("GOOGLE_DRIVE_COLLECTION_OWNER", "collection@example.test");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const extraRoot = "1z5GK_fjOlFbDd4YoycLzjBs17xsRT30f";

function mockDrive(respond: (url: URL) => Response, rootAvailable = true) {
  const fetchMock = vi.fn(async (input: URL | string) => {
    const url = new URL(input.toString());
    if (url.pathname.endsWith(`/${extraRoot}`)) {
      return rootAvailable
        ? Response.json({ id: extraRoot, name: "Deuxième collection", mimeType: "application/vnd.google-apps.folder" })
        : new Response(null, { status: 404 });
    }
    const q = url.searchParams.get("q") ?? "";
    if (q.includes("mimeType = 'application/vnd.google-apps.folder'")) {
      return Response.json({ files: q.includes(`'${extraRoot}' in parents`)
        ? [{ id: "extra-child" }]
        : q.includes("'extra-child' in parents") ? [{ id: "extra-nested" }] : [] });
    }
    return respond(url);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("collections Google Drive", () => {
  it("compte toutes les pages avec uniquement les identifiants de la collection autorisée", async () => {
    const fetchMock = mockDrive((url) => {
      if ((url.searchParams.get("q") ?? "").includes(" and not (")) return Response.json({ files: [{ id: "extra" }] });
      return url.searchParams.has("pageToken")
        ? Response.json({ files: [{ id: "b" }, { id: "c" }] })
        : Response.json({ files: [{ id: "a" }], nextPageToken: "la-suite" });
    });
    const { countDriveFiles } = await import("./google-drive");

    expect(await countDriveFiles()).toMatchObject({ count: 4, isComplete: true, incompleteSearch: false });
    const pages = fetchMock.mock.calls.map(([url]) => new URL(url)).filter((url) => url.searchParams.get("fields") === "nextPageToken,incompleteSearch,files(id)");
    const [first, second, additional] = pages;
    expect(first.searchParams.get("q")).toBe(
      "'collection@example.test' in owners and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    );
    expect(first.searchParams.get("pageSize")).toBe("1000");
    expect(first.searchParams.get("fields")).toBe("nextPageToken,incompleteSearch,files(id)");
    expect(first.searchParams.has("pageToken")).toBe(false);
    expect(second.searchParams.get("pageToken")).toBe("la-suite");
    expect(second.searchParams.get("q")).toBe(first.searchParams.get("q"));
    expect(additional.searchParams.get("q")).toContain(`'${extraRoot}' in parents`);
    expect(additional.searchParams.get("q")).toContain("'extra-nested' in parents");
    expect(additional.searchParams.get("q")).toContain("not ('collection@example.test' in owners)");
  });

  it("garde le filtre de sécurité et la recherche par nom des ressources", async () => {
    const fetchMock = mockDrive((url) => Response.json({ files: (url.searchParams.get("q") ?? "").includes(" and not (")
      ? [{ id: "b", name: "Kit UI nouveau", modifiedTime: "2026-01-01" }]
      : [{ id: "a", name: "Kit UI", modifiedTime: "2025-01-01" }] }));
    const { searchDriveFiles } = await import("./google-drive");

    expect((await searchDriveFiles({ query: "kit UI", pageSize: 60 })).map((file) => file.id)).toEqual(["b", "a"]);
    const url = fetchMock.mock.calls.map(([input]) => new URL(input)).find((item) => item.searchParams.get("orderBy"))!;
    expect(url.searchParams.get("q")).toBe(
      "'collection@example.test' in owners and mimeType != 'application/vnd.google-apps.folder' and trashed = false and name contains 'kit' and name contains 'UI'",
    );
    expect(url.searchParams.get("pageSize")).toBe("60");
  });

  it("garde la première collection disponible si le dossier ajouté n'est pas partagé", async () => {
    mockDrive(() => Response.json({ files: [{ id: "old", name: "Ancienne ressource" }] }), false);
    const { searchDriveCatalog, countDriveFiles } = await import("./google-drive");
    const search = await searchDriveCatalog({ query: "ressource" });
    expect(search.files.map((file) => file.id)).toEqual(["old"]);
    expect(search.warning).toContain("pas accessible");
    expect(await countDriveFiles()).toMatchObject({ count: 1, isComplete: true, incompleteSearch: true });
  });

  it.each(["direct", "imbriqué", "ancienne collection"])("autorise un téléchargement %s", async (kind) => {
    const fetchMock = mockDrive((url) => {
      if (url.searchParams.get("alt") === "media") return new Response("archive", { headers: { "Content-Type": "application/zip" } });
      if (url.pathname.endsWith("/child")) return Response.json({ parents: [extraRoot] });
      return Response.json({
        id: "file", name: "archive.zip", mimeType: "application/zip", size: "7",
        parents: [kind === "direct" ? extraRoot : "child"],
        owners: [{ emailAddress: kind === "ancienne collection" ? "collection@example.test" : "other@example.test" }],
      });
    });
    const { getFileDownloadStream } = await import("./google-drive");
    expect((await getFileDownloadStream("file")).file.id).toBe("file");
    expect(fetchMock.mock.calls.some(([input]) => new URL(input).searchParams.get("alt") === "media")).toBe(true);
  });

  it("refuse un autre fichier du propriétaire du deuxième dossier situé hors du périmètre", async () => {
    const fetchMock = mockDrive((url) => url.pathname.endsWith("/file")
      ? Response.json({ id: "file", name: "personnel.zip", mimeType: "application/zip", parents: ["private"], owners: [{ emailAddress: "other@example.test" }] })
      : Response.json({ parents: [] }));
    const { getFileDownloadStream } = await import("./google-drive");
    await expect(getFileDownloadStream("file")).rejects.toThrow("Accès refusé");
    expect(fetchMock.mock.calls.some(([input]) => new URL(input).searchParams.get("alt") === "media")).toBe(false);
  });

  it("revérifie l'ascendance au téléchargement même si le sous-dossier était indexé auparavant", async () => {
    const fetchMock = mockDrive((url) => {
      if (url.searchParams.has("q")) return Response.json({ files: [] });
      if (url.pathname.endsWith("/file")) return Response.json({ id: "file", name: "déplacé.zip", parents: ["extra-child"], owners: [] });
      if (url.pathname.endsWith("/extra-child")) return Response.json({ parents: ["private"] });
      return Response.json({ parents: [] });
    });
    const { searchDriveFiles, getFileDownloadStream } = await import("./google-drive");
    await searchDriveFiles({ query: "kit" });
    await expect(getFileDownloadStream("file")).rejects.toThrow("Accès refusé");
    expect(fetchMock.mock.calls.some(([input]) => new URL(input).searchParams.get("alt") === "media")).toBe(false);
  });
});
