import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
vi.mock("@/lib/auth/admin-session", () => ({ ADMIN_SESSION_COOKIE: "admin", verifyAdminSessionToken: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "admin-token" }) }) }));
vi.mock("@/lib/drive/google-drive", () => ({ getFileDownloadStream: vi.fn() }));
vi.mock("@/lib/wallet/store", () => ({ hasStudentUnlockedFile: vi.fn() }));
import { getSessionEnrollment } from "@/lib/auth/session";
import { verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { getFileDownloadStream } from "@/lib/drive/google-drive";
import { hasStudentUnlockedFile } from "@/lib/wallet/store";
import { GET } from "./route";
const request = () => GET(new Request("https://www.forgeia.site/api/ressources/drive/download/file"), { params: Promise.resolve({ fileId: "file" }) });

describe("Drive student download isolation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(verifyAdminSessionToken).mockResolvedValue(true);
  });
  it("refuses an unpaid file even if the student browser also has an administrator session", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student" } as never);
    vi.mocked(hasStudentUnlockedFile).mockResolvedValue(false);
    expect((await request()).status).toBe(403);
    expect(hasStudentUnlockedFile).toHaveBeenCalledWith("student", "file");
    expect(verifyAdminSessionToken).not.toHaveBeenCalled();
    expect(getFileDownloadStream).not.toHaveBeenCalled();
  });
  it("keeps administrator access when no student is signed in", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue(null);
    vi.mocked(getFileDownloadStream).mockResolvedValue({
      stream: new ReadableStream(), file: { id: "file", name: "test.zip", mimeType: "application/zip" }, contentType: "application/zip",
    });
    expect((await request()).status).toBe(200);
    expect(hasStudentUnlockedFile).not.toHaveBeenCalled();
  });
});
