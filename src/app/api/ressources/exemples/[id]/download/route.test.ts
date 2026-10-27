import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/website-examples/server", () => ({ getExamplesCatalog: vi.fn(), signExampleDownload: vi.fn() }));
vi.mock("@/lib/website-examples/access", () => ({ getExamplesViewer: vi.fn() }));
vi.mock("@/lib/wallet/store", () => ({ hasStudentUnlockedFile: vi.fn() }));
import { getExamplesCatalog, signExampleDownload } from "@/lib/website-examples/server";
import { getExamplesViewer } from "@/lib/website-examples/access";
import { hasStudentUnlockedFile } from "@/lib/wallet/store";
import { GET } from "./route";
const entry = { id: "demo-accounting", archive: "accounting", collection: "forgeia-1" };
const catalog = { release: "forgeia-sites-v2", entries: [entry] };
const request = (id = entry.id) => GET(new Request("https://www.forgeia.site/api/ressources/exemples/x/download?key=private"), { params: Promise.resolve({ id }) });

describe("private example downloads", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getExamplesViewer).mockResolvedValue({ isAdmin: false, enrollmentId: "student" });
    vi.mocked(getExamplesCatalog).mockResolvedValue(catalog as never);
  });
  it("never reads storage or signs a URL without an authorized viewer", async () => {
    vi.mocked(getExamplesViewer).mockResolvedValue(null);
    expect((await request()).status).toBe(401);
    expect(getExamplesCatalog).not.toHaveBeenCalled();
    expect(signExampleDownload).not.toHaveBeenCalled();
  });
  it("rejects paths and unknown entries", async () => {
    expect((await request("../private")).status).toBe(404);
    expect((await request("unknown")).status).toBe(404);
    expect(signExampleDownload).not.toHaveBeenCalled();
  });
  it("refuses locked ZIPs without generating a signed URL", async () => {
    vi.mocked(hasStudentUnlockedFile).mockResolvedValue(false);
    expect((await request()).status).toBe(403);
    expect(hasStudentUnlockedFile).toHaveBeenCalledWith("student", "html:forgeia-1:accounting");
    expect(signExampleDownload).not.toHaveBeenCalled();
  });
  it("only signs the server catalog entry after checking the purchased archive", async () => {
    vi.mocked(hasStudentUnlockedFile).mockResolvedValue(true);
    vi.mocked(signExampleDownload).mockResolvedValue("https://private-download.example");
    const response = await request();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(signExampleDownload).toHaveBeenCalledWith(catalog, entry);
  });
  it("allows the admin without a paid unlock", async () => {
    vi.mocked(getExamplesViewer).mockResolvedValue({ isAdmin: true });
    vi.mocked(signExampleDownload).mockResolvedValue("https://private-download.example");
    expect((await request()).status).toBe(200);
    expect(hasStudentUnlockedFile).not.toHaveBeenCalled();
  });
  it("does not expose storage errors", async () => {
    vi.mocked(getExamplesCatalog).mockRejectedValue(new Error("internal AWS details"));
    const response = await request();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("AWS");
  });
});
