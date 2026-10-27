import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getExamplesViewer } from "./access";
describe("HTML purchase identity", () => {
  beforeEach(() => vi.resetAllMocks());
  it("takes the enrollment identity from the session", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student", payments: [] } as never);
    expect(await getExamplesViewer()).toEqual({ isAdmin: false, enrollmentId: "student" });
  });
  it("rejects a suspended student", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student", accessOverride: "blocked", payments: [] } as never);
    expect(await getExamplesViewer()).toBeNull();
  });
  it("uses student rights even if a valid admin cookie is also present", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student", payments: [] } as never);
    expect(await getExamplesViewer()).toEqual({ isAdmin: false, enrollmentId: "student" });
    expect(isAdminAuthenticated).not.toHaveBeenCalled();
  });
  it("does not let an old admin cookie bypass a student's suspension", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student", accessOverride: "blocked", payments: [] } as never);
    expect(await getExamplesViewer()).toBeNull();
    expect(isAdminAuthenticated).not.toHaveBeenCalled();
  });
  it("allows an administrator when no student session is present", async () => {
    vi.mocked(getSessionEnrollment).mockResolvedValue(null);
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    expect(await getExamplesViewer()).toEqual({ isAdmin: true });
  });
});
