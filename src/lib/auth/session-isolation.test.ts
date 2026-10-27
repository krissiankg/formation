import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ cookies: new Map<string, string>() }));
vi.mock("next/headers", () => ({ cookies: async () => ({
  get: (name: string) => state.cookies.has(name) ? { value: state.cookies.get(name) } : undefined,
  set: (name: string, value: string) => { state.cookies.set(name, value); },
  delete: (name: string) => { state.cookies.delete(name); },
}) }));
vi.mock("@/lib/store/enrollments", () => ({
  getEnrollment: async (id: string) => ({ id, fullName: "Test", payments: [] }),
  findEnrollmentByEmailAndWhatsapp: vi.fn(),
}));
vi.mock("@/lib/wallet/store", () => ({
  getOrCreateStudentWallet: async () => ({ balanceCoins: 10 }),
  listStudentUnlockedFileIds: async () => ["html:forgeia-2:articles"],
  listStudentTransactions: async () => [],
  hasStudentUnlockedFile: vi.fn(async () => false),
  debitCoinsForFile: vi.fn(),
}));
vi.mock("@/lib/website-examples/server", () => ({
  getExamplesCatalog: vi.fn(async () => ({ release: "test-release", entries: [{ id: "test-site", archive: "test-site", collection: "forgeia-1" }] })),
  signExampleDownload: vi.fn(async () => "https://download.example.test/file.zip"),
}));

import { createSession, getSessionEnrollment } from "./session";
import { createAdminSession, isAdminAuthenticated } from "./admin";
import { ADMIN_SESSION_COOKIE, STUDENT_SESSION_COOKIE } from "./session-cookies";
import { getExamplesViewer } from "@/lib/website-examples/access";
import { GET as getWallet } from "@/app/api/wallet/route";
import { GET as getStudentDownload } from "@/app/api/ressources/exemples/[id]/download/route";
import { GET as getAdminDownload } from "@/app/api/admin/ressources/exemples/[id]/download/route";
import { hasStudentUnlockedFile, debitCoinsForFile } from "@/lib/wallet/store";
import { signExampleDownload } from "@/lib/website-examples/server";

describe("switching between administrator and student", () => {
  beforeEach(() => {
    state.cookies.clear();
    vi.clearAllMocks();
    vi.stubEnv("ADMIN_SESSION_SECRET", "isolated-session-test-secret");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("signing in as a student keeps the separate administrator session", async () => {
    await createAdminSession();
    expect(await isAdminAuthenticated()).toBe(true);
    await createSession("student");
    expect(await isAdminAuthenticated()).toBe(true);
    expect(state.cookies.has(ADMIN_SESSION_COOKIE)).toBe(true);
    expect((await getSessionEnrollment())?.id).toBe("student");
  });

  it("signing in as administrator keeps the separate student session", async () => {
    await createSession("student");
    await createAdminSession();
    expect((await getSessionEnrollment())?.id).toBe("student");
    expect(state.cookies.has(STUDENT_SESSION_COOKIE)).toBe(true);
    expect(await isAdminAuthenticated()).toBe(true);
  });

  it("two valid signed sessions keep student wallet and purchases in the student space", async () => {
    await createAdminSession();
    await createSession("student");
    expect(await isAdminAuthenticated()).toBe(true);
    expect(await getExamplesViewer()).toEqual({ isAdmin: false, enrollmentId: "student" });
    expect(await (await getWallet()).json()).toMatchObject({
      isAdmin: false, balance: 10, unlockedFileIds: ["html:forgeia-2:articles"],
    });
  });

  it("the same browser gets unlimited admin downloads and paid student downloads without a debit", async () => {
    await createAdminSession();
    await createSession("student");
    const params = { params: Promise.resolve({ id: "test-site" }) };
    const studentResponse = await getStudentDownload(new Request("https://www.forgeia.site/api/ressources/exemples/test-site/download"), params);
    expect(studentResponse.status).toBe(403);
    expect(signExampleDownload).not.toHaveBeenCalled();
    vi.mocked(hasStudentUnlockedFile).mockClear();
    const adminResponse = await getAdminDownload(new Request("https://www.forgeia.site/api/admin/ressources/exemples/test-site/download"), params);
    expect(adminResponse.status).toBe(200);
    expect(signExampleDownload).toHaveBeenCalledOnce();
    expect(hasStudentUnlockedFile).not.toHaveBeenCalled();
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });

  it("a student session alone cannot use the administrator download endpoint", async () => {
    await createSession("student");
    const response = await getAdminDownload(new Request("https://www.forgeia.site/api/admin/ressources/exemples/test-site/download"), { params: Promise.resolve({ id: "test-site" }) });
    expect(response.status).toBe(401);
    expect(signExampleDownload).not.toHaveBeenCalled();
    expect(debitCoinsForFile).not.toHaveBeenCalled();
  });
});
