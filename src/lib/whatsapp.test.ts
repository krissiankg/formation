import { describe, expect, it } from "vitest";
import { contact } from "@/lib/config/formation";
import { toWhatsAppDigits } from "@/lib/whatsapp";

describe("toWhatsAppDigits", () => {
  it("adds the country code to a Benin number typed in the 10-digit format", () => {
    expect(toWhatsAppDigits("01 66 36 87 05")).toBe("2290166368705");
  });

  it("keeps a full international number as it is", () => {
    expect(toWhatsAppDigits("+229 01 66 36 87 05")).toBe("2290166368705");
  });

  it("upgrades an old 8-digit Benin number to the 10-digit format", () => {
    expect(toWhatsAppDigits("66 36 87 05")).toBe("2290166368705");
    expect(toWhatsAppDigits("+229 66 36 87 05")).toBe("2290166368705");
  });

  it("leaves a foreign number untouched", () => {
    expect(toWhatsAppDigits("+33 6 12 34 56 78")).toBe("33612345678");
  });
});

describe("contact WhatsApp link", () => {
  it("uses the 10-digit Benin format, the one WhatsApp accounts now have", () => {
    expect(contact.whatsappUrl.startsWith("https://wa.me/2290166368705?text=")).toBe(true);
  });
});
