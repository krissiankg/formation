import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatWhatsAppDigits, notifyWhatsApp, whatsAppNumberCandidates } from "@/lib/integrations";

describe("whatsAppNumberCandidates", () => {
  // Bénin : numéros à 10 chiffres (préfixe 01) depuis fin 2024, mais WhatsApp connaît
  // beaucoup de comptes uniquement sous l'ancien format 229 + 8 chiffres.
  it.each([
    ["01 40 16 25 21", ["22940162521", "2290140162521"]],
    ["+229 01 40 16 25 21", ["22940162521", "2290140162521"]],
    ["2290140162521", ["22940162521", "2290140162521"]],
    ["66368705", ["22966368705", "2290166368705"]],
    ["22966368705", ["22966368705", "2290166368705"]],
    ["00229 66 36 87 05", ["22966368705", "2290166368705"]],
  ])("tries both Benin formats for %s", (input, expected) => {
    expect(whatsAppNumberCandidates(input)).toEqual(expected);
  });

  it("keeps other countries as a single number", () => {
    expect(whatsAppNumberCandidates("+225 07 12 34 56 78")).toEqual(["2250712345678"]);
  });

  it("formats a 10-digit Benin number to the old WhatsApp form", () => {
    expect(formatWhatsAppDigits("0140162521")).toBe("22940162521");
  });
});

describe("notifyWhatsApp via Evolution API", () => {
  const sent: { url: string; body: unknown }[] = [];

  function stubEvolution(lookup: (numbers: string[]) => Response) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        const body = init?.body ? JSON.parse(String(init.body)) : undefined;
        sent.push({ url: input, body });
        if (input.endsWith("/chat/whatsappNumbers/ForgeIA")) return lookup(body.numbers);
        if (input.endsWith("/message/sendText/ForgeIA")) {
          return Response.json(
            {
              key: { remoteJid: `${body.number}@s.whatsapp.net`, fromMe: true, id: "3EB0TEST" },
              message: { conversation: body.text },
              messageTimestamp: 1793548800,
              status: "PENDING",
            },
            { status: 201 },
          );
        }
        return new Response("not found", { status: 404 });
      }),
    );
  }

  const exists = (known: string) => (numbers: string[]) =>
    Response.json(numbers.map((n) => ({ jid: `${n}@s.whatsapp.net`, exists: n === known, number: n })));

  const sendTextNumbers = () =>
    sent.filter((c) => c.url.endsWith("/message/sendText/ForgeIA")).map((c) => (c.body as { number: string }).number);

  beforeEach(() => {
    sent.length = 0;
    vi.stubEnv("EVOLUTION_API_URL", "https://evolution.example.test/");
    vi.stubEnv("EVOLUTION_API_INSTANCE", "ForgeIA");
    vi.stubEnv("EVOLUTION_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends to the old Benin form when WhatsApp knows that one", async () => {
    stubEvolution(exists("22940162521"));
    const res = await notifyWhatsApp("01 40 16 25 21", "Bonjour");
    expect(res).toEqual({ ok: true, stub: false, provider: "evolution" });
    expect(sendTextNumbers()).toEqual(["22940162521"]);
  });

  it("sends to the new Benin form when only that one exists", async () => {
    stubEvolution(exists("2290129405566"));
    await notifyWhatsApp("0129405566", "Bonjour");
    expect(sendTextNumbers()).toEqual(["2290129405566"]);
  });

  it("falls back to the old form when the lookup fails", async () => {
    stubEvolution(() => new Response("boom", { status: 500 }));
    await notifyWhatsApp("0140162521", "Bonjour");
    expect(sendTextNumbers()).toEqual(["22940162521"]);
  });

  it("skips the lookup for a non-Benin number", async () => {
    stubEvolution(exists("nothing"));
    await notifyWhatsApp("+225 07 12 34 56 78", "Bonjour");
    expect(sent.map((c) => c.url)).toEqual(["https://evolution.example.test/message/sendText/ForgeIA"]);
  });
});
