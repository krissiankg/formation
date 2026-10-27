import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthenticated: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getSessionEnrollment: vi.fn() }));
vi.mock("@/lib/wallet/store", () => ({ getOrCreateStudentWallet: vi.fn(), listStudentUnlockedFileIds: vi.fn(), listStudentTransactions: vi.fn() }));
import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getOrCreateStudentWallet, listStudentUnlockedFileIds, listStudentTransactions } from "@/lib/wallet/store";
import { GET } from "./route";
describe("wallet role consistency", () => {
  beforeEach(() => vi.resetAllMocks());
  it("gives the administrator access when no student session is present", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(getSessionEnrollment).mockResolvedValue(null);
    expect(await (await GET()).json()).toMatchObject({ isAdmin: true });
    expect(getOrCreateStudentWallet).not.toHaveBeenCalled();
  });
  it("returns the student's own paid rights and real balance", async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true);
    vi.mocked(getSessionEnrollment).mockResolvedValue({ id: "student" } as never);
    vi.mocked(getOrCreateStudentWallet).mockResolvedValue({ balanceCoins: 25 } as never);
    vi.mocked(listStudentUnlockedFileIds).mockResolvedValue(["html:forgeia-1:restaurant"]);
    vi.mocked(listStudentTransactions).mockResolvedValue([]);
    expect(await (await GET()).json()).toMatchObject({ isAdmin: false, balance: 25, unlockedFileIds: ["html:forgeia-1:restaurant"] });
    expect(getOrCreateStudentWallet).toHaveBeenCalledWith("student");
    expect(isAdminAuthenticated).not.toHaveBeenCalled();
  });
});
