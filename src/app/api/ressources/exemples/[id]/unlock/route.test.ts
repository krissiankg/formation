import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/website-examples/server", () => ({ getExamplesCatalog: vi.fn() }));
vi.mock("@/lib/website-examples/access", () => ({ getExamplesViewer: vi.fn() }));
vi.mock("@/lib/wallet/store", () => ({ debitCoinsForFile: vi.fn() }));
import { getExamplesViewer } from "@/lib/website-examples/access";
import { getExamplesCatalog } from "@/lib/website-examples/server";
import { debitCoinsForFile } from "@/lib/wallet/store";
import { POST } from "./route";

const entry = { id: "f2-restaurant", archive: "restaurant", collection: "forgeia-2", title: "Restaurant", archiveBytes: 120 * 1024 * 1024 };
const request = (id = entry.id) => POST(new Request("https://www.forgeia.site/api/ressources/exemples/" + id + "/unlock", {
  method: "POST", body: JSON.stringify({ expectedCost: 20, size: 1, coinsCost: 0, fileId: "free" }),
}), { params: Promise.resolve({ id }) });

describe("HTML archive purchases", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getExamplesViewer).mockResolvedValue({ isAdmin: false, enrollmentId: "student" });
    vi.mocked(getExamplesCatalog).mockResolvedValue({ entries: [entry] } as never);
    vi.mocked(debitCoinsForFile).mockResolvedValue({ success: true, newBalance: 80, alreadyUnlocked: false });
  });
  it("requires an active account before looking up the catalog", async () => {
    vi.mocked(getExamplesViewer).mockResolvedValue(null);
    expect((await request()).status).toBe(401);
    expect(getExamplesCatalog).not.toHaveBeenCalled();
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
  it("rejects unknown and unsafe IDs without charging", async () => {
    expect((await request("../private")).status).toBe(404);
    expect((await request("unknown")).status).toBe(404);
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
  it("ignores browser prices, file keys, names and sizes", async () => {
    const response = await request();
    expect(response.status).toBe(200);
    expect(debitCoinsForFile).toHaveBeenCalledWith("student", "html:forgeia-2:restaurant", "FORGEIA HTML — Restaurant", 20);
    expect(await response.json()).toMatchObject({ success: true, cost: 20, newBalance: 80 });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
  it("uses the same paid right for another page in the same ZIP", async () => {
    vi.mocked(getExamplesCatalog).mockResolvedValue({ entries: [{ ...entry, id: "f2-restaurant-menu" }] } as never);
    await request("f2-restaurant-menu");
    expect(vi.mocked(debitCoinsForFile).mock.calls[0][1]).toBe("html:forgeia-2:restaurant");
  });
  it("does not charge a new price that the student has not confirmed", async () => {
    const response = await POST(new Request("https://www.forgeia.site/api/ressources/exemples/x/unlock", { method: "POST", body: JSON.stringify({ expectedCost: 10 }) }), { params: Promise.resolve({ id: entry.id }) });
    expect(response.status).toBe(409);
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
  it("returns 402 when the wallet cannot cover the archive price", async () => {
    vi.mocked(debitCoinsForFile).mockResolvedValue({ success: false, newBalance: 5, error: "Solde insuffisant" });
    const response = await request();
    expect(response.status).toBe(402);
    expect(await response.json()).toMatchObject({ balance: 5, cost: 20 });
  });
  it("reports an existing purchase without requesting a new price", async () => {
    vi.mocked(debitCoinsForFile).mockResolvedValue({ success: true, newBalance: 0, alreadyUnlocked: true });
    expect(await (await request()).json()).toMatchObject({ success: true, alreadyUnlocked: true, newBalance: 0 });
  });
  it("does not charge administrators", async () => {
    vi.mocked(getExamplesViewer).mockResolvedValue({ isAdmin: true });
    expect(await (await request()).json()).toMatchObject({ success: true, cost: 0 });
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
  it("fails closed when the transaction is unavailable", async () => {
    vi.mocked(debitCoinsForFile).mockRejectedValue(new Error("private database details"));
    const response = await request();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private database");
  });
});
