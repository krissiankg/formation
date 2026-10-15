import { describe, expect, it } from "vitest";
import { BUDGET_EXHAUSTED_MESSAGE, checkBudget, meterSseStream } from "@/lib/ia/meter";
import type { IaUsage } from "@/lib/ia/pricing";

function sseStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Découpage volontairement irrégulier pour vérifier la reconstitution des lignes.
      const text = events.map((e) => `data: ${e}\n\n`).join("");
      for (let i = 0; i < text.length; i += 7) controller.enqueue(encoder.encode(text.slice(i, i + 7)));
      controller.close();
    },
  });
}

async function drain(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

const delta = (content: string) => JSON.stringify({ choices: [{ delta: { content } }] });

describe("meterSseStream", () => {
  it("passes bytes through and reports the final usage chunk", async () => {
    const events = [delta("Bon"), delta("jour"), JSON.stringify({ choices: [], usage: { prompt_tokens: 10, completion_tokens: 2 } })];
    const calls: [IaUsage | null, number][] = [];
    const out = await drain(meterSseStream(sseStream(events), (usage, chars) => calls.push([usage, chars])));
    expect(out).toBe(events.map((e) => `data: ${e}\n\n`).join(""));
    expect(calls).toEqual([[{ promptTokens: 10, cachedTokens: 0, completionTokens: 2 }, 7]]);
  });

  it("estimates usage when the stream has no usage chunk", async () => {
    const calls: [IaUsage | null, number][] = [];
    await drain(meterSseStream(sseStream([delta("Bon"), delta("jour"), "[DONE]"]), (u, c) => calls.push([u, c])));
    expect(calls).toEqual([[null, 7]]);
  });

  it("reports once when the client cancels the stream", async () => {
    const calls: number[] = [];
    const metered = meterSseStream(sseStream([delta("Bon"), delta("jour")]), (_u, c) => calls.push(c));
    const reader = metered.getReader();
    await reader.read();
    await reader.cancel();
    expect(calls).toHaveLength(1);
  });
});

describe("checkBudget", () => {
  it("refuses when remaining budget is zero or less", async () => {
    const refused = checkBudget(0);
    expect(refused?.status).toBe(402);
    expect((await refused!.json()).error.message).toBe(BUDGET_EXHAUSTED_MESSAGE);
    expect(checkBudget(-5)?.status).toBe(402);
    expect(checkBudget(0.01)).toBeNull();
  });

  it("uses the exact French message from the spec", () => {
    expect(BUDGET_EXHAUSTED_MESSAGE).toBe(
      "Ton crédit IA FORGE IA est épuisé. Recharge-le avec tes coins dans ton espace (Mon assistant IA).",
    );
  });
});
