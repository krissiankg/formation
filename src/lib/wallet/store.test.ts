import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: () => db }));
import { debitCoinsForFile, creditCoins } from "./store";
describe("wallet atomic operations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.from.mockImplementation(() => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { enrollment_id: "student", balance_coins: 40, created_at: "now", updated_at: "now" } }) }) }) }));
  });
  it("delegates debit, ownership and journal to one transaction", async () => {
    db.rpc.mockResolvedValue({ data: [{ success: true, new_balance: 30, already_unlocked: false }], error: null });
    expect(await debitCoinsForFile("student", "html:forgeia-1:restaurant", "Restaurant", 10)).toMatchObject({ success: true, newBalance: 30 });
    expect(db.rpc).toHaveBeenCalledOnce();
    expect(db.rpc).toHaveBeenCalledWith("unlock_resource_with_coins", { p_enrollment: "student", p_file_id: "html:forgeia-1:restaurant", p_file_name: "Restaurant", p_cost: 10 });
  });
  it("preserves an existing purchase even with no remaining coins", async () => {
    db.rpc.mockResolvedValue({ data: [{ success: true, new_balance: 0, already_unlocked: true }] });
    expect(await debitCoinsForFile("student", "html:forgeia-1:restaurant", "Restaurant", 10)).toEqual({ success: true, newBalance: 0, alreadyUnlocked: true });
  });
  it("returns the current balance for insufficient funds", async () => {
    db.rpc.mockResolvedValue({ data: [{ success: false, new_balance: 5, already_unlocked: false }] });
    expect(await debitCoinsForFile("student", "resource", "Resource", 10)).toMatchObject({ success: false, newBalance: 5 });
  });
  it("never falls back to separate writes on a database error", async () => {
    db.rpc.mockResolvedValue({ data: null, error: { message: "missing RPC" } });
    await expect(debitCoinsForFile("student", "resource", "Resource", 10)).rejects.toThrow("Impossible de débloquer");
    expect(db.rpc).toHaveBeenCalledOnce();
  });
  it("rejects invalid costs before using the database", async () => {
    await expect(debitCoinsForFile("student", "resource", "Resource", -1)).rejects.toThrow();
    expect(db.from).not.toHaveBeenCalled();
    expect(db.rpc).not.toHaveBeenCalled();
  });
  it("credits atomically with a payment reference", async () => {
    db.rpc.mockResolvedValue({ data: 90, error: null });
    expect(await creditCoins("student", 50, "fedapay_purchase", "Recharge", "tx-1")).toBe(90);
    expect(db.rpc).toHaveBeenCalledWith("credit_wallet_coins", { p_enrollment: "student", p_amount: 50, p_type: "fedapay_purchase", p_description: "Recharge", p_reference: "tx-1" });
  });
  it("fails on an unavailable credit transaction", async () => {
    db.rpc.mockResolvedValue({ error: { message: "database down" } });
    await expect(creditCoins("student", 10, "admin_bonus", "Bonus")).rejects.toThrow();
  });
});
