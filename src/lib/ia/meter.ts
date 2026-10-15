import { iaError } from "@/lib/ia/http";
import { parseUsage, type IaUsage } from "@/lib/ia/pricing";

export const BUDGET_EXHAUSTED_MESSAGE =
  "Ton crédit IA FORGE IA est épuisé. Recharge-le avec tes coins dans ton espace (Mon assistant IA).";

/** Refus (402) quand le crédit IA restant est épuisé ; null sinon. */
export function checkBudget(remainingFcfa: number): Response | null {
  return remainingFcfa > 0 ? null : iaError(402, BUDGET_EXHAUSTED_MESSAGE, "insufficient_quota");
}

/**
 * Laisse passer un flux SSE (chat/completions en streaming) tel quel, en relevant au passage le bloc
 * `usage` final et le nombre de caractères générés. `onDone` est appelé une seule fois : fin normale,
 * annulation par le client ou erreur.
 */
export function meterSseStream(
  body: ReadableStream<Uint8Array>,
  onDone: (usage: IaUsage | null, streamedChars: number) => void,
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  let usage: IaUsage | null = null;
  let chars = 0;
  let reported = false;

  const readLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") return;
    try {
      const event = JSON.parse(data) as {
        usage?: unknown;
        choices?: { delta?: { content?: unknown } }[];
      };
      if (event.usage) usage = parseUsage(event.usage) ?? usage;
      for (const choice of event.choices ?? []) {
        if (typeof choice.delta?.content === "string") chars += choice.delta.content.length;
      }
    } catch {
      // Ligne non JSON : on la transmet sans la compter.
    }
  };

  const report = () => {
    if (reported) return;
    reported = true;
    if (buffer) readLine(buffer);
    onDone(usage, chars);
  };

  const reader = body.getReader();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          report();
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(readLine);
        controller.enqueue(value);
      } catch (error) {
        report();
        controller.error(error);
      }
    },
    async cancel(reason) {
      report();
      await reader.cancel(reason);
    },
  });
}
