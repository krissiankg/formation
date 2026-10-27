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
}));

import { createSession, getSessionEnrollment } from "./session";
import { createAdminSession, isAdminAuthenticated } from "./admin";
import { ADMIN_SESSION_COOKIE, STUDENT_SESSION_COOKIE } from "./session-cookies";
import { getExamplesViewer } from "@/lib/website-examples/access";
import { GET as getWallet } from "@/app/api/wallet/route";

describe("switching between administrator and student", () => {
  beforeEach(() => {
    state.cookies.clear();
    vi.stubEnv("ADMIN_SESSION_SECRET", "isolated-session-test-secret");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("signing in as a student ends the previous administrator session", async () => {
    await createAdminSession();
    expect(await isAdminAuthenticated()).toBe(true);
    await createSession("student");
    expect(await isAdminAuthenticated()).toBe(false);
    expect(state.cookies.has(ADMIN_SESSION_COOKIE)).toBe(false);
    expect((await getSessionEnrollment())?.id).toBe("student");
  });

  it("signing in as administrator ends the previous student session", async () => {
    await createSession("student");
    await createAdminSession();
    expect(await getSessionEnrollment()).toBeNull();
    expect(state.cookies.has(STUDENT_SESSION_COOKIE)).toBe(false);
    expect(await isAdminAuthenticated()).toBe(true);
  });

  it("existing browsers with two valid signed sessions retain only student rights in resources", async () => {
    await createAdminSession();
    const previousAdminToken = state.cookies.get(ADMIN_SESSION_COOKIE)!;
    await createSession("student");
    state.cookies.set(ADMIN_SESSION_COOKIE, previousAdminToken);
    expect(await isAdminAuthenticated()).toBe(true);
    expect(await getExamplesViewer()).toEqual({ isAdmin: false, enrollmentId: "student" });
    expect(await (await getWallet()).json()).toMatchObject({
      isAdmin: false, balance: 10, unlockedFileIds: ["html:forgeia-2:articles"],
    });
  });
});
