import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verify: vi.fn(), count: vi.fn(), configured: vi.fn(), stored: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "test-session" }) }) }));
vi.mock("@/lib/auth/admin-session", () => ({
  ADMIN_SESSION_COOKIE: "forge_admin_session", verifyAdminSessionToken: mocks.verify,
}));
vi.mock("@/lib/drive/google-drive", () => ({
  GOOGLE_DRIVE_FOLDER_ID: "test-folder", getStoredToken: mocks.stored,
  isDriveConfigured: mocks.configured, countDriveFiles: mocks.count,
}));
import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verify.mockResolvedValue(true);
  mocks.configured.mockResolvedValue(true);
  mocks.stored.mockResolvedValue({ connectedEmail: "admin@example.test" });
});
afterEach(() => vi.unstubAllEnvs());

describe("statut du comptage Drive administrateur", () => {
  it("ne lance aucune lecture Drive pour un visiteur non authentifié", async () => {
    mocks.verify.mockResolvedValue(false);
    const response = await GET(new Request("https://www.forgeia.site/api/admin/drive/status?refresh=1"));
    expect(response.status).toBe(401);
    expect(mocks.count).not.toHaveBeenCalled();
    expect(mocks.stored).not.toHaveBeenCalled();
  });

  it("distingue le comptage en cours d'un total définitif et transmet l'actualisation", async () => {
    mocks.count.mockResolvedValueOnce({ count: 3000, isComplete: false, incompleteSearch: false });
    const response = await GET(new Request("https://www.forgeia.site/api/admin/drive/status?refresh=1"));
    expect(await response.json()).toMatchObject({ fileCount: 3000, fileCountIsExact: false, isCounting: true });
    expect(mocks.count).toHaveBeenCalledWith(true);

    mocks.count.mockResolvedValueOnce({ count: 3042, isComplete: true, incompleteSearch: false });
    const finished = await GET(new Request("https://www.forgeia.site/api/admin/drive/status"));
    expect(await finished.json()).toMatchObject({ fileCount: 3042, fileCountIsExact: true, isCounting: false });
  });

  it("affiche une indisponibilité plutôt que zéro en cas d'erreur Google", async () => {
    mocks.count.mockRejectedValue(new Error("Accès Google expiré"));
    const response = await GET(new Request("https://www.forgeia.site/api/admin/drive/status"));
    expect(await response.json()).toMatchObject({
      fileCount: null, fileCountIsExact: false, isCounting: false, testError: "Accès Google expiré",
    });
  });

  it("ne présente pas une recherche Google incomplète comme un total exact", async () => {
    mocks.count.mockResolvedValue({ count: 1050, isComplete: true, incompleteSearch: true });
    const response = await GET(new Request("https://www.forgeia.site/api/admin/drive/status"));
    const status = await response.json();
    expect(status).toMatchObject({ fileCount: 1050, fileCountIsExact: false, isCounting: false });
    expect(status.testError).toContain("minimum");
  });
});
