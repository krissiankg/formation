import { describe, expect, it } from "vitest";
import { renderEmail } from "@/lib/email/layout";

describe("renderEmail", () => {
  it("escapes user text in the HTML", () => {
    const { html } = renderEmail({ title: "Bonjour", paragraphs: ["Awa <script>"] });
    expect(html).toContain("Awa &lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("puts the button link in the text version", () => {
    const { text } = renderEmail({
      title: "Ta préinscription",
      paragraphs: ["Il reste le paiement."],
      button: { label: "Payer", url: "https://www.forgeia.site/inscription/paiement" },
    });
    expect(text).toContain("Payer : https://www.forgeia.site/inscription/paiement");
  });
});
