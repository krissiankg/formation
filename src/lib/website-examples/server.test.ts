import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { canAccessExamples } from "./server";

describe("example access", () => {
  beforeEach(() => vi.resetAllMocks());
  it("allows the administrator without a student session", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    expect(await canAccessExamples()).toBe(true);
    expect(getSessionEnrollment).not.toHaveBeenCalled();
  });
  it("rejects anonymous and suspended accounts", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue(null);
    expect(await canAccessExamples()).toBe(false);
    vi.mocked(getSessionEnrollment).mockResolvedValue({ accessOverride: "blocked", payments: [] } as never);
    expect(await canAccessExamples()).toBe(false);
  });
  it("allows students to download the provisionally free examples", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue({ payments: [] } as never);
    expect(await canAccessExamples()).toBe(true);
  });
});
