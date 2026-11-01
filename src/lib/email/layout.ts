/**
 * Mise en page commune des emails FORGE IA : une version HTML sobre et une version texte.
 */

const BRAND = "#7a1f3d";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmail(input: {
  title: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  footnote?: string;
}): { html: string; text: string } {
  const paragraphs = input.paragraphs
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f1f1f;">${escapeHtml(p)}</p>`)
    .join("");
  const button = input.button
    ? `<p style="margin:22px 0;"><a href="${escapeHtml(input.button.url)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${escapeHtml(input.button.label)}</a></p>`
    : "";
  const footnote = input.footnote
    ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b6b6b;">${escapeHtml(input.footnote)}</p>`
    : "";

  const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f6f3f4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border-top:6px solid ${BRAND};">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;font-weight:700;color:${BRAND};">FORGE IA</p>
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#1f1f1f;">${escapeHtml(input.title)}</h1>
${paragraphs}${button}${footnote}
</div>
<p style="max-width:560px;margin:14px auto 0;font-size:11px;color:#8a8a8a;text-align:center;">FORGE IA · https://www.forgeia.site</p>
</body></html>`;

  const text = [
    input.title,
    "",
    ...input.paragraphs.flatMap((p) => [p, ""]),
    ...(input.button ? [`${input.button.label} : ${input.button.url}`, ""] : []),
    ...(input.footnote ? [input.footnote, ""] : []),
    "FORGE IA · https://www.forgeia.site",
  ].join("\n");

  return { html, text };
}
