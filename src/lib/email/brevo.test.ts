import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "@/lib/email/brevo";

const message = { subject: "Bienvenue", html: "<p>Bonjour</p>", text: "Bonjour" };

describe("sendEmail", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends the message through Brevo", async () => {
    vi.stubEnv("BREVO_API_KEY", "test-key");
    fetchMock.mockResolvedValue(Response.json({ messageId: "<202611011200.123@smtp-relay.mailin.fr>" }, { status: 201 }));

    const result = await sendEmail({ email: "awa@example.com", name: "Awa K" }, message);

    expect(result).toEqual({ ok: true, stub: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("api-key")).toBe("test-key");
    expect(JSON.parse(String(init.body))).toEqual({
      sender: { name: "FORGE IA", email: "notifications@forgeia.site" },
      to: [{ email: "awa@example.com", name: "Awa K" }],
      subject: "Bienvenue",
      htmlContent: "<p>Bonjour</p>",
      textContent: "Bonjour",
    });
  });

  it("logs instead of sending without a key", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    const result = await sendEmail({ email: "awa@example.com" }, message);
    expect(result).toEqual({ ok: true, stub: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never sends to test accounts", async () => {
    vi.stubEnv("BREVO_API_KEY", "test-key");
    await sendEmail({ email: "test@forgeia.local" }, message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a Brevo refusal without throwing", async () => {
    vi.stubEnv("BREVO_API_KEY", "test-key");
    fetchMock.mockResolvedValue(
      Response.json({ code: "invalid_parameter", message: "sender is not valid" }, { status: 400 }),
    );
    expect(await sendEmail({ email: "awa@example.com" }, message)).toEqual({ ok: false, stub: false });
  });

  it("reports a network error without throwing", async () => {
    vi.stubEnv("BREVO_API_KEY", "test-key");
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    expect(await sendEmail({ email: "awa@example.com" }, message)).toEqual({ ok: false, stub: false });
  });
});
