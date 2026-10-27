import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: vi.fn() }));
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { canAccessExamples, signExampleDownload } from "./server";

describe("example access", () => {
  beforeEach(() => vi.resetAllMocks());
  it("allows the administrator without a student session", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    expect(await canAccessExamples()).toBe(true);
    expect(getSessionEnrollment).toHaveBeenCalled();
  });
  it("rejects anonymous and suspended accounts", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue(null);
    expect(await canAccessExamples()).toBe(false);
    vi.mocked(getSessionEnrollment).mockResolvedValue({ accessOverride: "blocked", payments: [] } as never);
    expect(await canAccessExamples()).toBe(false);
  });
  it("allows students to browse the examples catalog", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue({ payments: [] } as never);
    expect(await canAccessExamples()).toBe(true);
  });
  it("signs a download from the entry's own collection release", async () => {
    vi.mocked(getSignedUrl).mockResolvedValue("https://signed.example");
    await signExampleDownload({ release: "forgeia-sites-v2" } as never, { archive: "construction", release: "forgeia-collection-2-v1" } as never);
    const command = vi.mocked(getSignedUrl).mock.calls[0][1];
    expect(command.input).toMatchObject({ Key: "website-examples/downloads/forgeia-collection-2-v1/construction.zip" });
    expect(vi.mocked(getSignedUrl).mock.calls[0][2]).toEqual({ expiresIn: 120 });
  });
});
