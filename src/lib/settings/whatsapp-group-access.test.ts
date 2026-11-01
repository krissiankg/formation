import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ reads: 0 }));
vi.mock("@/lib/supabase/admin", () => {
  const builder: Record<string, unknown> = {};
  for (const method of ["from", "select", "eq"]) builder[method] = () => builder;
  builder.maybeSingle = async () => {
    db.reads += 1;
    return { data: { value: { url: "https://chat.whatsapp.com/AbCdEf123456" } }, error: null };
  };
  return { getSupabaseAdmin: () => builder, isSupabaseConfigured: () => true };
});
import { getWhatsAppGroupUrlFor } from "@/lib/settings/whatsapp-group";

beforeEach(() => {
  db.reads = 0;
});

describe("getWhatsAppGroupUrlFor", () => {
  it("never reads the link for a student who has not paid", async () => {
    const url = await getWhatsAppGroupUrlFor({ payments: [{ kind: "registration", amount: 2500, status: "pending" }] });
    expect(url).toBeNull();
    expect(db.reads).toBe(0);
  });

  it("gives the link to a paid student", async () => {
    const url = await getWhatsAppGroupUrlFor({ payments: [{ kind: "registration", amount: 2500, status: "paid" }] });
    expect(url).toBe("https://chat.whatsapp.com/AbCdEf123456");
  });
});
