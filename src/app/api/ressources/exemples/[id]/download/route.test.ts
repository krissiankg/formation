import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/website-examples/server", () => ({ canAccessExamples: vi.fn(), getExamplesCatalog: vi.fn(), signExampleDownload: vi.fn() }));
import { canAccessExamples, getExamplesCatalog, signExampleDownload } from "@/lib/website-examples/server";
import { GET } from "./route";

describe("private example downloads", () => {
  beforeEach(() => vi.resetAllMocks());
  const request = (id: string) => GET(new Request("https://www.forgeia.site/api/ressources/exemples/x/download?key=private"), { params: Promise.resolve({ id }) });
  it("never reads storage or signs a URL without a session", async () => {
    vi.mocked(canAccessExamples).mockResolvedValue(false);
    expect((await request("demo-accounting")).status).toBe(401);
    expect(getExamplesCatalog).not.toHaveBeenCalled();
    expect(signExampleDownload).not.toHaveBeenCalled();
  });
  it("rejects paths and unknown entries", async () => {
    vi.mocked(canAccessExamples).mockResolvedValue(true);
    vi.mocked(getExamplesCatalog).mockResolvedValue({ entries: [] } as never);
    expect((await request("../private")).status).toBe(404);
    expect((await request("unknown")).status).toBe(404);
    expect(signExampleDownload).not.toHaveBeenCalled();
  });
  it("only signs the server's catalog entry and disables response caching", async () => {
    const entry = { id: "demo-accounting", archive: "accounting" };
    const catalog = { release: "crafto-v1", entries: [entry] };
    vi.mocked(canAccessExamples).mockResolvedValue(true);
    vi.mocked(getExamplesCatalog).mockResolvedValue(catalog as never);
    vi.mocked(signExampleDownload).mockResolvedValue("https://private-download.example");
    const response = await request(entry.id);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(signExampleDownload).toHaveBeenCalledWith(catalog, entry);
  });
  it("does not expose storage errors", async () => {
    vi.mocked(canAccessExamples).mockResolvedValue(true);
    vi.mocked(getExamplesCatalog).mockRejectedValue(new Error("internal AWS details"));
    const response = await request("demo-accounting");
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("AWS");
  });
});
