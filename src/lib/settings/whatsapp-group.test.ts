import { describe, expect, it } from "vitest";
import { isWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

describe("isWhatsAppGroupUrl", () => {
  it.each(["https://chat.whatsapp.com/AbCdEf123456", "https://chat.whatsapp.com/AbCdEf123456?s=cl&p=a"])(
    "accepts the invite link %s",
    (url) => {
      expect(isWhatsAppGroupUrl(url)).toBe(true);
    },
  );

  it.each([
    "http://chat.whatsapp.com/AbCdEf123456",
    "https://evil.example/chat.whatsapp.com/x",
    "https://chat.whatsapp.com/",
    "javascript:alert(1)",
  ])("refuses %s", (url) => {
    expect(isWhatsAppGroupUrl(url)).toBe(false);
  });
});
