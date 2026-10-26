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

describe("requêtes Google Drive du compteur", () => {
  it("compte toutes les pages avec uniquement les identifiants de la collection autorisée", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ files: [{ id: "a" }], nextPageToken: "la-suite" }))
      .mockResolvedValueOnce(Response.json({ files: [{ id: "b" }, { id: "c" }] }));
    vi.stubGlobal("fetch", fetchMock);
    const { countDriveFiles } = await import("./google-drive");

    expect(await countDriveFiles()).toEqual({ count: 3, isComplete: true, incompleteSearch: false });
    const [first, second] = fetchMock.mock.calls.map(([url]) => new URL(url));
    expect(first.searchParams.get("q")).toBe(
      "'collection@example.test' in owners and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    );
    expect(first.searchParams.get("pageSize")).toBe("1000");
    expect(first.searchParams.get("fields")).toBe("nextPageToken,incompleteSearch,files(id)");
    expect(first.searchParams.has("pageToken")).toBe(false);
    expect(second.searchParams.get("pageToken")).toBe("la-suite");
    expect(second.searchParams.get("q")).toBe(first.searchParams.get("q"));
  });

  it("garde le filtre de sécurité et la recherche par nom des ressources", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ files: [{ id: "a", name: "Kit UI" }] }));
    vi.stubGlobal("fetch", fetchMock);
    const { searchDriveFiles } = await import("./google-drive");

    expect(await searchDriveFiles({ query: "kit UI", pageSize: 60 })).toEqual([{ id: "a", name: "Kit UI" }]);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("q")).toBe(
      "'collection@example.test' in owners and mimeType != 'application/vnd.google-apps.folder' and trashed = false and name contains 'kit' and name contains 'UI'",
    );
    expect(url.searchParams.get("pageSize")).toBe("60");
  });
});
