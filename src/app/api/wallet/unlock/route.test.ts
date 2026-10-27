import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
vi.mock("@/lib/auth/admin-session", () => ({ ADMIN_SESSION_COOKIE: "admin", verifyAdminSessionToken: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/wallet/store", () => ({ debitCoinsForFile: vi.fn() }));
import { getSessionEnrollment } from "@/lib/auth/session";
import { debitCoinsForFile } from "@/lib/wallet/store";
import { POST } from "./route";
describe("Drive unlock namespace", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student" } as never);
  });
  it("cannot buy an HTML right through the client-priced Drive endpoint", async () => {
    const response = await POST(new Request("https://www.forgeia.site/api/wallet/unlock", { method: "POST", body: JSON.stringify({ fileId: "html:forgeia-2:restaurant", fileName: "cheap", size: 1 }) }));
    expect(response.status).toBe(400);
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
});
